$(()=>{

    let exercises=$('#exercises');
    $.get('/customer/currentexercise',(exercise)=>{
        for(let eachExercise of exercise){
            let listelement=$(`<li>${eachExercise.exerciseName}<br>${eachExercise.exerciseDescription}</li>`);
            exercises.append(listelement);
        }
    })
    $('#changeTrainer').click(()=>{
        window.location='../availableTrainer.html';
    })
    $('#history').click(()=>{
        window.location='../custHistory.html';
    })
    $('#custProfile').click(()=>{
        window.location='../custProfile.html';
    })
    $('#trainerDetails').click(()=>{
        window.location='../trainerdetails.html';
    })
    $('#chat').click(()=>{
        window.location='../chat.html';
    })
});