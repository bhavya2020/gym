$(()=>{
    let history=$('#history');
    $.get('/customer/history',(exercise)=>{
        for(let eachHistory of exercise){
            let listelement=$(`<li>${eachHistory.exerciseName}<br>${eachHistory.exerciseDescription}</li>`);
            history.append(listelement);
        }
    })
});