<template>
    <div>
        <el-card shadow="hover">
            <el-table style="width:100%;" border
                :data="data"
                :span-method="cellMerge">
               
                <el-table-column label="编码"
                    header-align="center"
                    width="150">
                </el-table-column>
               
            </el-table>
        </el-card>
    </div>
</template>

<script>
import {
    

} from '@/api/curtain'
import Cookies from 'js-cookie'
import { mapMutations, mapActions } from 'vuex'
import { mapState } from 'vuex'

export default {
    name: 'purDetail',
    data(){
        return{
            cid: Cookies.get('cid'),  //假定给的用户id
            customerType: Cookies.get('customerType'), //客户类型
            getParams: Cookies.get('curtainMsg'),  //获取传入的参数 
        }
    },
    props: ['headerData','curtainData','tableStatus','suggestion','isModified','STATUS_ID'],
    methods:{
        //关闭表格
        // closeTable(){
        //     this.addTab('shoppingCar/shopping?curtain');
        //     this.closeTab('detail/detailCurtain');
        // },
     
    },
    computed:{
        // data(){
        //     console.log(1,this.curtainData)
        //     return JSON.parse(JSON.stringify(this.curtainData));
        // }
    },
    
   
}
</script>

<style scoped>

#messageRight{
    margin: 20px 40px;
    display: inline-block;
    vertical-align: middle;
}
#messageRight tr td:nth-child(1){
    text-align: right;
}
#messageRight tr td:nth-child(2){
    padding-left: 20px;
}
#messageRight td{
    padding: 5px;
    font-size: 14px;
}
#curtainTable tr td{ padding: 6px 3px; }
#shoppingMsg>p{ margin: 20px auto; }
.messageBox>div{
    padding: 10px 0;
}
.messageInput{
    border: 1px solid #c3c3c3;
    margin-right: 3px;
    padding: 3px 6px 3px 6px;
    min-width: 65px;
    border-radius: 4px;
    color: gray;
    display: inline-block;
}
</style>