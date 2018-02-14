$(()=>{
    let trainerList=$('#trainers');
    $.get('/trainers/all',(trainers)=>{

       for(let trainer of trainers)
       {
           let li=$(`<li id="${trainer._id}"> <input type="radio" name="trainers" > ${trainer.name}</li>`);
           trainerList.append(li);
       }
    });



    $('#submit').click(()=>{

        $.post('/customer/chooseTrainer',{
          id:$('input[name="trainers"]:checked')[0].parentNode.id
        },()=>{

        })
    })
});