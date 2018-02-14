$(()=>{
   let trainerDetails=$('#trainerDetails');
   $.get('/customer/trainerDetails',(detail)=>{
       trainerDetails.append($(`<p>${detail.name}<br></p><p>${detail.phoneNo}<br></p><p>${detail.email}<br></p>`))
   })
});