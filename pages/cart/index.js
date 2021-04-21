// pages/cart/index.js
/*
1 获取用户的收获地址
  1绑定点击事件
  2调用小程序内置api 获取用户的收货地址 wx.chooseAddress
2 获取 用户对小程序所授予获取地址的权限状态scope
  1 假设用户点击获取收货地址的提示框 确定 authSetting scope.address
  scope的值为true
  2 假设用户 从来没有调用过 收货地址的api
  scope undefined 直接调用 获取收货地址
  3 假设用户点击获取收货地址的提示框 取消 
    scope值为false
2 页面加载完毕 
  0  onLoad onShow
  1 获取本地存储中的地址数据
  2 把数据 设置给data中的一个变量

3 onShow 
  0 回到了商品的详情页面 第一次添加商品的时候 手动添加了属性
    1 num=1;
    2 checked=true;
  1 获取缓存中的购物车数组
  2 把购物车数据填充到data中

4 全选的实现 数据的展示
  1 onShow 获取缓存中的购物车数组
  2 根据购物车中的商品数据计算 所有的商品都被选中了 全选就被选中

5 商品总价格和总数量
  1 都需要商品被选中，我们才拿他计算
  2 获取购物车数组
  3 遍历数组
  4 判断商品是否被选中
  5 总价格+= 商品单价*商品数量
    总数量+= 商品的数量
  6 把计算后的价格和数量 设置回data即可
6 商品的选中
  1 绑定change事件
  2 获取被修改的参数对象
  3 商品对象的选中状态 取反
  4 重新填充回data中和缓存中
  5 重新计算全选 总价格 总数量。。
7 全选和反选
  1 全选复选框绑定事件 change
  2 获取data中的全选变量 allChecked
  3 直接取反 allChecked=！allChecked
  4 遍历购物车数组 让里面 商品 选中状态跟随 allChecked 改变而改变
  5 把购物车数组 和allChecked 重新设置回data中， 把购物车重新设置回 缓存中
8 商品数量的编辑
  1 “+”“-”绑定同一个事件 区分的关键 自定义属性
    “+” "+1"
    “-” "-1"
  2 传递被点击的商品id goods_id
  3 获取data中的购物车数组 来获取需要被修改的商品对象
  4 当购物车的数量=1时，用户点击“-”
    弹窗提示(showModel) 询问用户 是否要删除
    1 确定 直接执行删除
    2 取消 什么都不做
  4 直接修改商品对象的数量 num
  5 把cart数组 重新设置回缓存中 和data中 this.setCart
9 点击结算
  1 判断是否有收货地址信息
  2 判断用户是否选中商品
  3 经过以上验证 ，跳转到支付页面  
*/ 
//使用 es7 中的 async 和 await 方法
import regeneratorRuntime from '../../lib/runtime/runtime'
//进入 封装的 微信小程序 api 模块
import {getSetting,chooseAddress,openSetting, showModal,showTost} from '../../utils/asyncWx.js'

Page({

  data:{
    address:{},
    cart:[],
    allchecked:false,
    totalPrice:0,
    totalNum:0,
  },
  onShow(){
    // 1获取缓存中的收货地址信息
    const address = wx.getStorageSync("address");
    this.setData({
      address
    })
    //  1 获取缓存中的购物车数据
    const cart=wx.getStorageSync("cart")||[];
    this.setCart(cart);
  },
  // 商品的选中
  handleItemChange(e){
    // 1 获取被修改的商品的id
    console.log(e);
    const goods_id=e.currentTarget.dataset.id;
    console.log(goods_id);
    // 2 获取购物车数组
    let {cart} =this.data;
    // 3 找到被修改的商品对象
    let index=cart.findIndex(v=>v.goods_price);
    // 4 选中状态取反
    cart[index].checked =!cart[index].checked;
  
   this.setCart(cart);
  },
 // 设置购物车状态 重新计算 底部工具栏的数据 全选 总价格 购买的数量
 setCart(cart){ 
   // 总价格 总数量
  let allChecked=true;
  let totalPrice=0;
  let totalNum = 0;
  cart.forEach(v => {
    if(v.checked){
      totalPrice+=v.num*v.goods_price;
      totalNum+=v.num; 
    }else{
      allChecked=false;
    }          
  });
   allChecked=cart.length!=0?allChecked:false;
    // 2 给data赋值
  this.setData({
    cart,
    allChecked,
    totalPrice,
    totalNum
  });
  wx.setStorageSync("cart",cart);
 },
 //  商品数量的编辑功能
 async handleItemNumEdit(e){
    // 1  获取传递过来的参数
    const {operation,id}=e.currentTarget.dataset;
    // 2 获取购物车数组
    let {cart} = this.data;
    // 3 找到需要修改的商品的索引
    const index = cart.findIndex(v=>v.goods_id===id);
    // 4 判断是否执行删除
    if(cart[index].num===1 && operation === -1){
      
      const res=await showModal({content:"您是否要删除？"})
      if (res.confirm) {
        cart.splice(index,1);
        this.setCart(cart);
      } 
      
    }else{
      // 4 进行修改数量
      cart[index].num+= operation;
       // 5 设置回缓存和data中
      this.setCart(cart);
    }
 },
 //点击获取收货地址
 async handelChooseAddress() {
  // 逻辑
  //    //1、获取用户权限
  //    wx.getSetting({
  //        success: (result) => {
  //         //    2、获取权限状态 只要发现一些 属性名很怪异的时候 都要用 [] 形式来获取属性值
  //            const scopeAddress = result.authSetting["scope.address"];
  //            if(scopeAddress===true||scopeAddress===undefined){
  //                wx.chooseAddress({
  //                    success:(result1)=>{
  //                     console.log(result1)
  //                    }
  //                })
  //            }else{
  //                //3、用户 以前拒绝过授予权限 先诱导用户打开权限页面
  //                wx.openSetting({
  //                    success: (result2) => {
  //                     //4、可以调用 获取收货地址
  //                        wx.chooseAddress({
  //                           success:(result3)=>{
  //                            console.log(result3)
  //                          }
  //                       })
  //                    },
  //                });
  //            }
  //        }
  //    });
      
  //依照逻辑的简化版
  // 1、获取 权限状态
 try{
  const res1 = await getSetting();
  const scopeAddress = res1.authSetting['scope.address'];
  // 2 判断 权限状态
  if(scopeAddress === false){
      // 先诱导用户打开授权页面
      await openSetting();
  }
  //4、调用获取收货地址的 api
  const res2 = await chooseAddress();
  //将获取到的 地址值存储到本地缓存中
  wx.setStorageSync('address', res2);
  console.log(res2)
 }catch(err){
     console.error(err)
 }
 },
//  点击结算后的功能
 async handlePay(){
 //  1 判断收获地址
 const {address, totalNum} = this.data;
   if(totalNum===0){
     await showTost({title:"您还没有选择商品"});
     return;
   }
   if(!address.username){
      await showTost({title:"您还没有选择收获地址"});
      return;
   }
  //  2 判断用户有没有选购商品
  
  // 3 跳转到 支付页面
  wx.wx.navigateTo({
    url: '/pages/pay/index',
  });
  }
})

