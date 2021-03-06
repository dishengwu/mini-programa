// 同时发送异步代码的次数
let ajaxTimes=0;
export const request=(params)=>{

// 显示加载中效果
    ajaxTimes++;
    wx.showLoading({
        title: "加载中",
        mask: true
    });

// 定义公共的url
    const baseUrl="https://api-hmugo-web.itheima.net/api/public/v1";
    return new Promise((resolve,reject)=>{
        wx.request({
            ...params,
            url:baseUrl + params.url,
            success:(result)=>{
                resolve(result.data.message);
            },
            fail:(err)=>{
                reject(err);
            },
            complete:()=>{
                ajaxTimes--;
                if(ajaxTimes===0){
                    // 关闭图标
                    wx.hideLoading();
                }
                
            }
        });
          
    })
}