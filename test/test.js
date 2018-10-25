
let flag = true;

const handle = {
    change(content){
        console.log(this);
        console.log(content);
    }
}


async function ready(handle) {
    
    const a = new Promise((resolve, reject) => {

        setTimeout(() => {
            resolve('hello world!');
        }, 3000);

    });

    handle.change(false);

    let result = await a;

    handle.change(result);
}

console.log(ready(handle));
