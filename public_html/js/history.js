$(()=>{
    let queryString = decodeURIComponent(window.location.search);
    queryString = queryString.substring(1);
    queryString=queryString.substr(3);
    let history=$('#history');
    $.post('/customer/history',{
        id:queryString
    },(exercise)=>{
        for(let eachHistory of exercise){
            let listelement=$(`<li>${eachHistory.exerciseName}<br>${eachHistory.exerciseDescription}</li>`);
            history.append(listelement);
        }
    })
});