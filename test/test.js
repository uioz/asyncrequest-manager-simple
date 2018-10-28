const { AsyncRequestManagerSimple } = require('../dist/asyncrequest-manager-simple.js');

let Demo = new AsyncRequestManagerSimple();

const hostName = 'www.baidu.com';


const timeOutPro = ()=>{
    return new Promise((resolve, reject) => {
        setTimeout(() => {
            resolve('done');
        }, 3000);
    });
};

// Demo.registerStragegy(hostName,'demo4',async (handle,inf)=>{
//     console.log(handle,inf)
//     return {
//         result:'done'
//     }
// });

Demo.registerStragegyTree({
    [hostName]: {
        'demo1':async (handle, inf) => {
            console.warn(1);
        
            await timeOutPro;
        
            return Object.assign(handle.arguments,{
                num:1
            });
        
        },
        'demo2':async (handle, inf) => {
            console.warn(2);
        
            await timeOutPro;
        
            throw new Error('Simulation Error');
        
            return Object.assign(handle.arguments,{
                num:2
            });
        
        },
        'demo3': async (handle, inf) => {
            console.warn(3);

            await timeOutPro;

            return Object.assign(handle.arguments,{
                num:3
            });

        }
    }
});

Demo.use({
    hostName:'www.baidu.com',
    RunningDiagramName:'testBackup',
    baseUrl:'http://www.baidu.com/',
    diagrams:[
        {
            stragegyName:'demo4'
        }
    ]
})

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
            runningDiagramGroup:[
                'testBackup'
            ],
            tryError:true
        },
        {
            stragegyName:'demo3',
        }
    ]
});

Demo.execute('test');
