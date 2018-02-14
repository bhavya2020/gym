$(()=> {
    show();
});
function add(ev) {
 let id = ev.target.parentElement.getAttribute('id');
 $.post('/trainers/add',
     {
         name:ev.target.parentElement.childNodes[1].value,
         description:ev.target.parentElement.childNodes[2].value,
         id: id
     },
     function () {
         show();
     })

}
function history(ev) {
    let id = ev.target.parentElement.getAttribute('id');
    var queryString = "?id=" + id;
    window.location="../history.html"+queryString;
}
function show() {

    let customerList = $('#customers');
    customerList.html(" ");
    $.get("/trainers/exercises",(customers)=>{

        for(let customer of customers )
        {
            let cs=$(`<li id="${customer.customerID}">${customer.customerID}<br></li>`);
            let exerciseList=$(`<ul id="${customer.customerID}"></ul>`);
            console.log(customer.exercises);
            for(let exercise of customer.exercises)
            {
                let li=$(`<li>${exercise.exerciseName}<br>${exercise.exerciseDescription}</li>`);
                exerciseList.append(li);
            }
            cs.append(exerciseList);
            let inpBox=$(`<input name="name" placeholder="name"><input name="description" placeholder="description">`);
            cs.append(inpBox);
            let addButton=$(`<button id="add">add</button>`);
            addButton.click(add);
            cs.append(addButton);
            let historyButton=$(`<button id="history">history</button>`);
            historyButton.click(history);
            cs.append(historyButton);
            customerList.append(cs);
        }
    })
}