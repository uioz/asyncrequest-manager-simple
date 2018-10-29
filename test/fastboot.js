const { AsyncRequestManagerSimple } = require('../dist/asyncrequest-manager-simple.js');

let Demo = new AsyncRequestManagerSimple();

const timeOutPro = () => {
    return new Promise((resolve, reject) => {
        setTimeout(() => {
            resolve('done');
        }, 500);
    });
};

const stragegyFun1 = async function (handle, inf) {

    console.log('step 1');
    console.log(handle.arguments);
    console.log(inf);
    await timeOutPro();

    return {};
};

const stragegyFun2 = async function (handle, inf) {

    console.log('step 2');
    console.log(handle.arguments);
    console.log(inf);
    await timeOutPro();

    return {};
};

const stragegyFun3= async function (handle, inf) {

    console.log('step 3');
    console.log(handle.arguments);
    console.log(inf);
    await timeOutPro();
    
};

Demo.fastBoot(stragegyFun1, stragegyFun2, stragegyFun3).then((result) => {

    console.log(`result=${JSON.stringify(result)}`);

});