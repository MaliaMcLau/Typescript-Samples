import { mergeMap } from 'rxjs/operators';
import { forkJoin, Subject } from 'rxjs';
import { Component, OnInit, TemplateRef, Input, AfterViewInit } from '@angular/core';
import { FlatTreeControl } from '@angular/cdk/tree';
import { MatTreeFlattener, MatTreeFlatDataSource } from '@angular/material/tree';

import { RedactedService } from './../redacted.service';
import { AccordionService } from './redacted-accordion.service';
import { TreeNode } from '../redacted-accordion.model';
import { RedactedNode } from '../redacted.model';

/**
 * @title Tree with dynamic data
 */
@Component({
  selector: 'app-redacted-accordion',
  templateUrl: './redacted-accordion.component.html',
  styleUrls: ['./redacted-accordion.component.css'],
  providers: [AccordionService]
})
export class RedactedAccordionComponent implements OnInit, AfterViewInit {

  flatNodeMap = new Map<TreeNode, RedactedNode>();

  nestedNodeMap = new Map<RedactedNode, TreeNode>();

  treeControl: FlatTreeControl<TreeNode>;

  treeFlattener: MatTreeFlattener<RedactedNode, TreeNode>;

  dataSource: MatTreeFlatDataSource<RedactedNode, TreeNode>;

  @Input() allRedactedsTemplate: TemplateRef<any>;
  @Input() redactedsTemplate: TemplateRef<any>;
  @Input() categoryRedactedsTemplate: TemplateRef<any>;
  @Input() searchBarData: Subject<RedactedNode[]>;

  constructor(private accordionService: AccordionService, private redactedService: RedactedService) {
    this.treeFlattener = new MatTreeFlattener(this.transformer, this.getLevel,
    this.isExpandable, this.getChildren);
    this.treeControl = new FlatTreeControl<TreeNode>(this.getLevel, this.isExpandable);
    this.dataSource = new MatTreeFlatDataSource(this.treeControl, this.treeFlattener);
    this.accordionService.dataChange
      .subscribe(
        (data: RedactedNode[]) => this.dataSource.data = data,
        error => console.error(error)
      );
  }

  ngOnInit() {
    if (!this.searchBarData) {
      this.accordionService.initializeData();
    }
  }

  ngAfterViewInit() {
    if (this.searchBarData) {
      this.searchBarData
        .subscribe(
          data => this.accordionService.reinitializeAccordionData(data),
          error => console.error(error)
        );
    }
  }

  isLoading = (node: TreeNode) => node.isLoading;

  getLevel = (node: TreeNode) => node.level;

  isExpandable = (node: TreeNode) => node.expandable;

  getChildren = (node: RedactedNode): RedactedNode[] => node.children;

  hasChild = (_: number, _nodeData: TreeNode) => _nodeData.expandable;

  hasNoContent = (_: number, _nodeData: TreeNode) => _nodeData.item.id === 0 || _nodeData.item.name === '';

  transformer = (node: RedactedNode, level: number) => {
    const existingNode = this.nestedNodeMap.get(node);
    const flatNode = existingNode && existingNode.item.name === node.name
      ? existingNode
      : new TreeNode();
    flatNode.item = {...flatNode.item, ...node};
    flatNode.level = level;
    flatNode.expandable = !!node.direct_children;
    this.flatNodeMap.set(flatNode, node);
    this.nestedNodeMap.set(node, flatNode);
    return flatNode;
  }

  /* Get the parent node of a node */
  getParentNode(childNode: TreeNode): TreeNode | null {
    const currentLevel = childNode.level;
    // If there is no parent return null
    if (currentLevel < 1) {
      return null;
    }
    // return the first node found with a level less than the child node level
    const startIndex = this.treeControl.dataNodes.indexOf(childNode) - 1;
    for (let i = startIndex; i >= 0; i--) {
      const currentNode = this.treeControl.dataNodes[i];
      if (currentNode.level < currentLevel) {
        return currentNode;
      }
    }
    return null;
  }

  getTreeControlNode(redactedIdList) {
    return this.treeControl.dataNodes.filter(redacted => {
      if (redactedIdList.indexOf(redacted.item.id) > -1) {
        return redacted;
      }
    });
  }

  toggleNode(parentNode: TreeNode) {
    if (parentNode.item.children.length > 0) {
      return;
    }
    this.accordionService.insertChildren(parentNode)
      .subscribe(
        () => this.treeControl.expand(parentNode),
        error => console.error(error)
      );
  }

  reloadNode(updatedRedactedIDs) {
    const reloadRedactedResponseArray = [];
    const redactedNodeList = this.getTreeControlNode(updatedRedactedIDs);
    for (const redacted of redactedNodeList) {
      reloadRedactedResponseArray.push(
        this.accordionService.reloadRedacted(redacted)
      );
    }
    return reloadRedactedResponseArray;
  }

  deleteRedacted(redactedForDelete: TreeNode, redactedForTransfer?: RedactedNode) {
    const parentNode = this.getParentNode(redactedForDelete);
    this.accordionService.deleteRedacted(redactedForDelete, parentNode, redactedForTransfer);
  }

  /** Build child treeNode, insert new treeNode into tree and expand parent node */
  addNewItem(parentNode: TreeNode) {
    const mappedParentNode = this.flatNodeMap.get(parentNode);
    // parent has no children
    if (parentNode.item.children.length === 0) {
      this.accordionService.insertChildren(parentNode)
        .subscribe(
          () => this.accordionService.insertItem(mappedParentNode, new RedactedNode()),
          error => console.error(error)
        );
    } else {
      this.accordionService.insertItem(mappedParentNode, new RedactedNode());
    }
    this.treeControl.expand(parentNode);
  }

  /** Save the node to database */
  saveNode(newChildNode: TreeNode, newRedactedName: string, options: object) {
    const newNode = this.flatNodeMap.get(newChildNode);
    newNode.name = 'pending';
    const parentNode = this.getParentNode(newChildNode);
    const name = newRedactedName;
    const parent_id = newNode.parent_id;
    const is_category = options['is_category'] ? 1 : 0;
    const mutual_exclusive = options['is_mutual'] ? 1 : 0;
    const payload = {name, parent_id, is_category, mutual_exclusive};
    this.redactedService.addChild(payload)
      .pipe(
        mergeMap(
          data => forkJoin(this.reloadNode(data['updated_redacted_IDs']))
        ),
        mergeMap(
          data => this.accordionService.reloadChildren(parentNode)
        )
      ).subscribe(
        error => console.error(error)
      );
  }

  // prepares payload for updating order of node
  reorderChildren(node: TreeNode, order: Number) {
    const payload = {order};
    const parentNode = this.getParentNode(node);
    this.accordionService.reorderChildren(node.item.id, payload, parentNode);
  }

  // node: the item requested to be moved
  // direction: whether the node is moving up or down. up => -1; down => 1
  childOrderDeadendCheck(node: TreeNode, direction: Number) {
    const parentNode = this.getParentNode(node);
    if (parentNode) {
      if ( (node.item.order === 1 && direction === -1)
        || (node.item.order === parentNode.item.children.length && direction === 1)) {
        return true;
      }
    }
    return false;
  }

  transferRedactedBetweenParents(redactedForTransfer: TreeNode, selectedAdoptiveParent: RedactedNode) {

    // get parent treeNode by RedactedNode for view update.
    // The selected parent RedactedNode is from database so need to do extra work
    let adoptiveParentTreeNode: TreeNode;
    this.nestedNodeMap.forEach((value, key) => {
      if (value.item.id === selectedAdoptiveParent.id) {
          adoptiveParentTreeNode = value;
      }
    });

    // get original parent treeNode for view update.
    const originParentNode = this.getParentNode(redactedForTransfer);
    const parent_id = selectedAdoptiveParent.id;

    this.redactedService.editRedacted(redactedForTransfer.item.id, {parent_id})
    .pipe(
      mergeMap(
        data => this.accordionService.reloadChildren(adoptiveParentTreeNode)
      ),
      mergeMap(
        data => this.accordionService.reloadChildren(originParentNode)
      )
    ).subscribe(
      error => console.error(error)
    );
  }

}
