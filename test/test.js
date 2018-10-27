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

Demo.registerStragegy(hostName,'demo4',async (handle,inf)=>{
    console.log(handle,inf)
    return {
        result:'done'
    }
});

Demo.registerStragegyTree({
    [hostName]: {
        'demo1':async (handle, inf) => {
            console.warn(1);
            console.warn(handle);
            console.warn(inf);
        
            await timeOutPro;
        
            return Object.assign(handle.arguments,{
                '1':1
            });
        
        },
        'demo2':async (handle, inf) => {
            console.warn(2);
            console.warn(handle);
            console.warn(inf);
        
            await timeOutPro;
        
            handle.fail();
        
            return Object.assign(handle.arguments,{
                '2':2
            });
        
        },
        'demo3': async (handle, inf) => {
            console.warn(3);
            console.warn(handle);
            console.warn(inf);

            await timeOutPro;

            return Object.assign(handle.arguments,{
                '3':3
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
