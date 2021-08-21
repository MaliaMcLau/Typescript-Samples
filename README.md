# Typescript-Samples
Here are some samples written in Typescript from my last position. Not my best work but it is what they could spare.

***Notes on Redacted-Accordion Component Sample***
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
  @Input() allRedactedsTemplate: TemplateRef<any>;
  @Input() redactedsTemplate: TemplateRef<any>;
  @Input() categoryRedactedsTemplate: TemplateRef<any>;
  @Input() searchBarData: Subject<RedactedNode[]>;

Various templates could be injected into the accordion by passing the TemplateRef type variables into the accordion component instance. This allowed for further customizations 
for what types of data were displayed. The redacted-accordion view contains three ng-container tag blocks that rely on the TemplateRef inputs. 

------------------------------------------------------
*Updating the Accordion after changes to Child Nodes.*
------------------------------------------------------
Whenever a change occurs on the Accordion, such as a child being edited or a child being moved to another parent, the accordion view needs to be updated. This is done in the 
AccordionService with the reloadChildren() function and with the native reloadNode function. Instead of reloading the entire view, it only reloads the node that was altered. 
Depending on the case, this may be the parent or parents of the child that was altered, or the child node itself. This was the quickest and most efficient technique when 
dealing with several categories/parents in a single view. There was no need to reload all the data for a single change.




