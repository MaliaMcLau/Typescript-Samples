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
for what types of data were displayed. The redacted-accordion view contains three ng-template tag blocks that display if the appropriate TemplateRef input is passed. 

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

The ordered placement was preserved for a set of child nodes with the same parent or category. On load, the order is persisted. A child node can be ascended or decended with the click of the *up* or *down* arrow icon buttons that are located on the child node row. When the order is changed, the children are updated using the reloadChildren() function as described above. I also needed to account for a child on either the very top or bottom of the list. The childOrderDeadendCheck() function would check if a child node is at either extreme and disable either the *up* or *down* arrow icon button in order to prevent moving a child beyond the extreme.

------------------------------------------------
#*Notes on Admin-tabs Component Sample*#
------------------------------------------------

![image](https://user-images.githubusercontent.com/8867874/130508194-80139efe-9ab4-407c-b591-72936acd27fb.png)
example of basic tabs from Angular Material

This is a generic component that is used for several administrative pages. The tabs are meant to be used on several pages in a variety of situations: data forms, list data and data relationships. Tabs are defined with the `Tab` interface, which includes a `label` for the view, a routing `link` that matches route strings in the `-routing.ts` file and a `status`, a unique reference to a tab.

There are two static tab profiles.
`tabs: Tab[]` handles tab several admin pages.
`redactedTabs: Tab[]` is a sub-set of tabs to handle one perticular admin case with features unique to that admin.
In hindsight, there might have been a better, more dynamic solution to replace these static tab profiles. Such a solution was offered, however, it involved omitting an interface which in my opinion is extremely bad practice in Typescript.

------------------------------------------------------
*Identifying the page as a form.*
------------------------------------------------------
```
this.activatedRoute.url
      .subscribe(
        data => {
          if ( data[0] ) {
            this.isForm = data[0]['path'] === 'edit'
          }
        }
      )
```

As a part of a dynamic Angular structure, this component needed to adapt to various page views. In the routes, the route to the form includes `/edit` as a suffix. `ActivatedRoute` has access to any item seen in the url string. In the above code snippet, we subscribe to activatedRoute.url and make a boolean assignment.
(Note: `route`, `url` and `endpoint string` can refer to the same information and the name depends on the context). 

------------------------------------------------------
*Defining essential page variables.*
------------------------------------------------------
These variables are essential for handling form requests, route navigation and for labeling in views so they are assigned higher in the component hierarchy. Again, `ActivatedRoute` is used to capture strings from the url.
```
this.activatedRoute.data
      .subscribe(
        data => this.actionType = data['type']
      );

```
This component can repesent a single data row or a list multiple rows. In every case, a page type is defined, which is called `actionType`. An `actionType` represents a particular database table.

```
this.activatedRoute.paramMap
      .subscribe(
        params => {
          this.actionID = params.get('id');
          this.bindingType = params.get('type');

          if ( this.actionID && this.actionType === 'redacted' && this.bindingType == null ) {
            this.tabs = this.redactedTabs;
          }

        }
      );
```

An `actionID` is optional and can represent a row ID for the data represented by the page. The `actionID` must be on the `actionType` table.
A `bindingType` is optional and can represent a foregin table of a data row that shares a relation-table row with the `action` row item.
In the case of a form, an update-form has both a valid `actionID` and valid `bindingType`, whereas a creation form has neither defined.

------------------------------------------------------
*Loading relationship pages.*
------------------------------------------------------
Pending

