# etables

so what is etables? just another table library with cool functionality built from scratch.

i had a project that i wanted to implement grouping, filtering, and aggregation. 
looked for ag-grid but it was not free "i guess". so i built this.

im not a front end developer so i expect this to have lots of pitfalls, and bad practices.. 

no npm, no modern stuff, just grap the js, css files and place them in your project.

---

# how to use:

1. construct the library: new ETable(columns, groupOptions);
2. add rows: etable.addRow(obj);
3. render: table = etable.render();

so whats in columns:
- name: column name
- field: is object[key] or property of the object
- filter: boolean, or string ?
- aggregate: string ['sum', 'max', 'avg', 'min', 'count'] or user defined function

what is groupingOptions:
- create it with ETable.createGroupingOption(field, groupBy);
- supported groupBy, ('year', 'decade', 'identity'), or user defined function

there is a good example in index.html

```
<script type="module">
  import ETable from "./js/ETable.js";
  loadTable();
        
  function loadTable() {
    let cols        = [ {name:"username", field:"user", filter:true},
                        {name:"date", field:"date", filter:true, type:'date'},
                        {name:"amount", field:"amount", aggregate:"sum"},
                        {name:"note", field:"note"}
                      ];

    let groupOptions = [    ETable.createGroupingOption('user', 'identity'),
                            ETable.createGroupingOption('date', d=>everyNthYear(d,5))
                       ];
            
    let etable       = new ETable(cols, groupOptions);
    let container    = document.getElementsByClassName("container")[0];
    data.forEach(c => {
      etable.addRow(c);
    });

    let table = etable.render();
    container.appendChild(table);
 
  }
</script>
```

