$(()=>{
    let custProfile=$('#custProfile');
    $.get('/customer/custProfile',(detail)=>{
        custProfile.append($(`<p>${detail.name}<br></p><p>${detail.age}<br></p><p>${detail.gender}<br></p><p>${detail.phoneNo}<br></p><p>${detail.email}<br></p><p>${detail.address}<br></p>`))
    })
});