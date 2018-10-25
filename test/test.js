
async function test() {
    
    let a = new Promise((resolve,reject)=>{
        setTimeout(() => {
            resolve('hello world')
        }, 3000);
    });

    let b = await a;

    
}

test().then(result=>console.log(result)).catch(error=>console.log(error));