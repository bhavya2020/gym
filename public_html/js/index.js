$( ()=> {
    $("#signup").click(()=>{
        $.get('/signup',()=>{
            window.location = '/signup.html'
        })

    });

    $("#login").click(()=>{
        $.get('/login',(data)=>{
            console.log(data);
            window.location = '/login.html'
        })
    });
    $("#logout").click(()=>{
        $.get('/logout',()=>{
            window.location = '/index.html';
        })

    })
});
