const { AsyncRequestManagerSimple } = require('../dist/asyncrequest-manager-simple.js');

let Demo = new AsyncRequestManagerSimple();

const hostName = 'www.baidu.com';

/**
 * 被视为一个请求操作
 */
const timeOutPro = ()=>{
    return new Promise((resolve, reject) => {
        setTimeout(() => {
            resolve('done');
        }, 500);
    });
};
// 注册一组策略函数
Demo.registerStragegyTree({
    [hostName]: {
        'demo1':async (handle, inf) => {
            
            console.warn('step 1');
            console.log(handle.arguments.num+'\n');
            
            handle.concurrency();

            await timeOutPro();

            let i = 10,result=[];
            while (i--) {
                result.push({
                    num:i
                });
            }

            return result;
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

            // TODO 
            if(handle.arguments.num ==5){
                handle.fail('message');
            }

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
// 注册一个配置
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

// 注册一个策略函数
Demo.registerStragegy(hostName,'demo4',async (handle,inf)=>{

    console.log('step 2');
    console.log(handle.arguments);
    
    return {
        num:20
    }
    
});
// 注册一个配置
Demo.use({
    hostName:'www.baidu.com',
    RunningDiagramName:'testBackup',
    baseUrl:'http://www.baidu.com/',
    diagrams:[
        {
            stragegyName:'demo4'
        }
    ]
});

// 执行并且打印结果
Demo.execute('test').then((result)=>{
    console.log('result = ',result);
});
