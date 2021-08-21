# Typescript-Samples
Here are some samples written in Typescript from my last position. This is not my best work but it is what could be shared publicly. To protect data structures still in use, some names have been redacted. Below I will explain some solutions I authored during this project.
------------------------------------------------
#*Notes on Redacted-Accordion Component Sample*#
------------------------------------------------
This project is built off of Angular Material Accordion. The main purpose of the project was to have a structure of categories and their children. Each category could have 
a child, which could be created, deleted, edited, or moved to another category. Also child node could have subchildren with the same behaviors.

(-)Category Node 1
  - Child Node 4
    - SubChild Node 5

(+)Category Node 6

(-)Category Node 9
  - Child Node Node 8

--------------------
*Template Injection*
--------------------
  ```
  @Input() allRedactedsTemplate: TemplateRef<any>;
  @Input() redactedsTemplate: TemplateRef<any>;
  @Input() categoryRedactedsTemplate: TemplateRef<any>;
  @Input() searchBarData: Subject<RedactedNode[]>;
  ```

Various templates could be injected into the accordion by passing the TemplateRef type variables into the accordion component instance. This allowed for further customizations 
for what types of data were displayed. The redacted-accordion view contains three ng-container tag blocks that rely on the TemplateRef inputs. 

------------------------------------------------------
*Updating the Accordion After Changes to Child Nodes.*
------------------------------------------------------
Whenever a change occurs on the Accordion, such as a child being edited or a child being moved to another parent, the accordion view needs to be updated. This is done in the 
AccordionService with the reloadChildren() function and with the native reloadNode function. Instead of reloading the entire view, it only reloads the node that was altered. 
Depending on the case, this may be the parent or parents of the child that was altered, or the child node itself. This was the quickest and most efficient technique when 
dealing with several categories/parents in a single view. There was no need to reload all the data for a single change.


------------------------------------------------------
*Transferring Child Node to Another Parent.*
------------------------------------------------------
Another feature was the ability to move a child to another parent. I needed to know the node being transferred, the original parent and the new adoptive parent. Simply, the parent property on the child node was updated with the new parent id. After the update, both parents would need to be updated.

------------------------------------------------------
*Reordering Child Nodes and Preventing Dead Ends*
------------------------------------------------------

- Category Node
 - [ ~~up~~ | down ] Child Node 1
 - [ up | down ] Child Node 6
 - [ up | down ] Child Node 2
 - [ up | down ] Child Node 3
 - [ up | down ] Child Node 4
 - [ up | ~~down~~ ] Child Node 5
- Category Node 2

The ordered placement was preserved for a set of child nodes with the same parent or category. On load, the order persisted. A child node can be ascended or decended with the click of the *up* or *down* arrow icon buttons that are located on the child node row. When the order is changed, the children are updated using the reloadChildren function as described above. I also needed to account for a child on either the very top or bottom of the list. The childOrderDeadendCheck() function would check if a child node is at either extreme and disable either the *up* or *down* arrow icon button in order to prevent moving a child beyond the extreme.

