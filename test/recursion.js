const { AsyncRequestManagerSimple } = require('../dist/asyncrequest-manager-simple.js');

let Demo = new AsyncRequestManagerSimple();

const hostName = 'www.baidu.com';


const timeOutPro = ()=>{
    return new Promise((resolve, reject) => {
        setTimeout(() => {
            resolve('done');
        }, 500);
    });
};


Demo.registerStragegyTree({
    [hostName]: {
        'demo1':async (handle, inf) => {
            
            console.warn('step 1');
            console.log(handle.arguments.num+'\n');
        
            await timeOutPro();
        
            return Object.assign(handle.arguments,{
                num:1
            });
        
        },
        'demo2':async (handle, inf) => {

            if(handle.arguments.num == 1){
                handle.recursion();
            }else if(handle.arguments.num ==10 ) {
                handle.stopRecursion();
                debugger;
            }

            console.warn('step 2');
            console.log(handle.arguments.num+'\n');

            await timeOutPro();

            return Object.assign(handle.arguments,{
                num:++handle.arguments.num
            });
        
        },
        'demo3': async (handle, inf) => {

            console.log('step 3');
            console.log(handle.arguments.num+'\n');

            await timeOutPro();

            return Object.assign(handle.arguments,{
                num:++handle.arguments.num
            });

        }
    }
});

Demo.use({
    hostName:'www.baidu.com',
    RunningDiagramName:'test',
    baseUrl:'http://www.baidu.com/',
    diagrams:[
        {
            stragegyName:'demo1',
        },
        {
            stragegyName:'demo2',
        },
        {
            stragegyName:'demo3',
        }
    ]
});

Demo.execute('test').then((result)=>{
    console.log(result);
});
