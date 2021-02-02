<template>
  <div>
    <el-card shadow="hover">
      <el-dialog :show-close="true" :visible.sync="batchTip_Visible" :close-on-click-modal="false" width="400px"
        top="20vh">
        <div>
          <div class="th-font16" align="center">请确定批量送货日期:</div>
          <el-card>
            <el-date-picker v-model="batchdate_deliver" type="date" format="yyyy-MM-dd" value-format="yyyy-MM-dd"
              placeholder="选择时间" style="width:40%"></el-date-picker>
            <el-button style="width:40% align:right" class="button_4" @click="BatchSure">确认</el-button>
          </el-card>
        </div>
      </el-dialog>
      <!-- X开头（窗帘）确认采购单界面 -->
      <el-dialog :show-close="true" :visible.sync="checkX_Visible" :close-on-click-modal="false" disabled="true"
        width="1170px" top="8vh">
        <div style="width:100%">
          <div style="margin-bottom:10px">
            <div align="center" class="th-font18"> <span>广东玉兰集团股份有限公司采购单（<span
                  class="th-font18color">{{ pur_headForm.PUR_NO }} </span>）</span>
            </div>
          </div>
          <div>
            <h4 style="font-weight:normal">收货人：{{ pur_headForm.LINKMAN }}
              &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;日期： {{pur_headForm.DATE_PUR | datatrans }}</h4>
          </div>
          <div style="margin-bottom:10px">
            <h4 style="font-weight:normal">备注信息：{{ pur_headForm.NOTES }}</h4>
          </div>
          <hr />
          <div style="width:100%">
            <el-table :data="colName" :show-header="false" border object_class="_Object:GridTable" object_hashcode="6"
              cellpadding="0" style="width:100%" class="tb_font14_bold">
              <af-table-column property="name1" label="位置" align="center" width="120"></af-table-column>
              <af-table-column property="name2" label="名称" align="center" width="80"></af-table-column>
              <af-table-column property="name3" label="编码" align="center" width="120"></af-table-column>
              <af-table-column property="name4" label="名称" align="center" width="150"></af-table-column>
              <af-table-column property="name5" label="规格:米/对" width="60"></af-table-column>
              <el-table-column property="name6" label="用量" align="center" width="60"></el-table-column>
              <el-table-column property="name7" label="含税单价" align="center" width="100"></el-table-column>
              <el-table-column property="name8" label="金额" align="center" width="80"></el-table-column>
              <el-table-column property="name9" label="制造说明" align="center" width="80"></el-table-column>
              <el-table-column property="name10" label="备注" align="center" width="130"></el-table-column>
              <el-table-column property="name11" label="生产备注" align="center"></el-table-column>
            </el-table>
            <div>
              <div v-for="(item, index) of items" :key="index">
                <!-- 未确认订单详情循环因子 -->
                <div style="display:flex;">

                  <div style="width:115px;padding:3px;">
                    <div class="messageBox1">
                      <div class="tb_font14_bold"> {{ index + 1 }} &nbsp; {{
                            item.tab1[index].cl_place === null ||
                            item.tab1[index].cl_place == ""
                              ? "无"
                              : item.tab1[index].cl_place
                          }}</div>
                    </div>
                    <div class="messageBox">
                      <div>
                        <label>款号：</label>
                        <div class="messageInput">
                          {{ item.tab1[index].cl_item_no }}
                        </div>
                      </div>
                      <div>
                        <label>成品宽：</label>
                        <div class="messageInput">
                          {{ item.tab1[index].cl_width }}
                        </div>
                        m
                      </div>
                      <div>
                        <label>成品高：</label>
                        <div class="messageInput">
                          {{ item.tab1[index].cl_high }}
                        </div>
                        m
                      </div>
                      <div>
                        <label>假帘高：</label>
                        <div class="messageInput">
                          {{ item.tab1[index].cl_high_jia }}
                        </div>
                        m
                      </div>
                      <div>
                        <label>帘倍数：</label>
                        <div class="messageInput">
                          {{ item.tab1[index].cl_size_times }}
                        </div>
                      </div>
                      <div>
                        <label>帘头外包盒单边宽:</label>
                        <div v-if=" item.tab1[index].cl_wbh_width>=0 " class="messageInput">
                          {{ item.tab1[index].cl_wbh_width }}
                        </div>
                        <div v-else class="messageInput">无</div>
                        m
                      </div>
                    </div>
                  </div>
                  <div style="flex:1">
                    <el-table :data="item.tab2[index]" :show-header="false"
                      :span-method="function(col){ return arraySpanMethod(col,index)}" class="tb_font13" border
                      object_class="_Object:GridTable" object_hashcode="6" cellpadding="0" style="width:100%;">
                      <el-table-column label="inner名称" align="center" width="80"> <template
                          slot-scope="scope">{{getTypeName(scope.row.cl_name)}}</template> </el-table-column>
                      <el-table-column prop="item_no" width="120" label="inner编码"></el-table-column>
                      <el-table-column prop="mname" label="inner名称" header-align="center" width="150"></el-table-column>
                      <el-table-column prop="grade" label="inner规格:米/对" header-align="center" width="60">
                      </el-table-column>
                      <el-table-column label="inner用量" align="right" width="60">
                        <template slot-scope="scope">{{scope.row.qty_pur}}{{scope.row.unit1}}
                        </template>
                      </el-table-column>
                      <el-table-column label="inner含税单价" header-align="center" align="right" width="100">
                        <template slot-scope="scope">
                          {{scope.row.price_taxin|numFilter}}
                        </template>
                      </el-table-column>
                      <el-table-column label="inner金额" header-align="center" align="right" width="80">
                        <template slot-scope="scope">
                          {{scope.row.total_money|numFilter}}
                        </template>
                      </el-table-column>
                      <el-table-column prop="product_note" label="inner制造说明" header-align="center" width="80">
                      </el-table-column>
                      <el-table-column prop="notes" label="inner备注" header-align="center" width="130"></el-table-column>
                      <el-table-column prop="lj_product_note" label="inner生产备注" header-align="center"></el-table-column>
                    </el-table>
                  </div>
                </div>

                <el-table class="tb_font12_bold" style="width:100%;" :show-header="false" :data="item.tab3[index]">
                  <el-table-column prop="date_req" label="预约" header-align="center" width="120"></el-table-column>
                  <el-table-column prop="date_deliver" label="交货" header-align="center" width="200"></el-table-column>
                  <el-table-column label="名称" header-align="center" width="150"></el-table-column>
                  <el-table-column label="规格:米/对" header-align="center" align="center" width="60"> </el-table-column>
                  <el-table-column label="用量" header-align="center" align="center" width="60"></el-table-column>
                  <el-table-column label="含税单价" header-align="center" align="right" width="100"><template> 小计
                    </template></el-table-column>
                  <el-table-column label="金额" header-align="left" align="right" width="80">
                    <template slot-scope="scope">
                      {{scope.row.littleSum|numFilter}}
                    </template>
                  </el-table-column>
                  <el-table-column label="制造说明" header-align="center" align="center" width="80"></el-table-column>
                  <el-table-column label="备注" header-align="center" align="center" width="130"></el-table-column>
                  <el-table-column label="生产备注" header-align="center" align="center"></el-table-column>
                </el-table>
                <!-- /未确认订单详情循环因子 -->
              </div>
            </div>
            <el-table :data="sumMoneyCol" :show-header="false" object_class="_Object:GridTable" object_hashcode="6"
              cellpadding="0" style="width:100%" class="tb_font14_bold">
              <af-table-column property="name1" label="位置" width="120"></af-table-column>
              <af-table-column property="name2" label="名称" align="center" width="80"></af-table-column>
              <af-table-column property="name3" label="编码" width="120"></af-table-column>
              <af-table-column property="name4" label="名称" width="150"></af-table-column>
              <af-table-column property="name5" label="规格:米/对" width="60"></af-table-column>
              <el-table-column property="name6" label="用量" width="60"></el-table-column>
              <el-table-column property="name7" label="含税单价" header-align="center" align="right" width="100">
              </el-table-column>
              <el-table-column label="金额" align="right" width="80">
                <template slot-scope="scope">
                  {{scope.row.name8|numFilter}}
                </template>
              </el-table-column>
              <el-table-column property="name9" label="制造说明" width="80"></el-table-column>
              <el-table-column property="name10" label="备注" width="130"></el-table-column>
              <el-table-column property="name11" label="生产备注"></el-table-column>
            </el-table>

            <hr />
            <div style="margin-top:10px">
              <div style="margin-bottom:10px;width:100%" class="data_1">
                <el-card style="min-height:100px">
                  <div>
                    <span class="th-font16">送货日期:</span>
                    <el-date-picker v-model="date_deliver" type="date" format="yyyy-MM-dd" value-format="yyyy-MM-dd"
                      placeholder="选择时间" style="width:18%"></el-date-picker>
                  </div>
                  <div style="margin-top:20px">
                    <span class="th-font16"> 说 &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;明:</span>
                    <el-input v-model="supply_check_notes" placeholder="说明:" style="width:42%;height:10px" clearable>
                    </el-input>
                    <el-button @click="SaveNotes()" style="width:10%;" class="button_clolur">保存说明
                    </el-button>
                  </div>
                </el-card>
              </div>
            </div>
            <div>
              <el-button @click="SubmitVue" style="width:10%;margin-left:35%;margin-top:10px" type="warning"
                size="small">确认</el-button>
              <el-button @click="returnMain" style="width:10%;margin-left:5%;margin-top:10px" type="primary"
                size="small">返回</el-button>
            </div>
          </div>
        </div>
      </el-dialog>
      <!-- 非X开头确认采购单界面兰 ==================================================================================-->
      <el-dialog :show-close="true" :visible.sync="checkY_Visible" :close-on-click-modal="false" disabled="true"
        width="1080px" top="8vh">
        <div id="checkYPrint" style="margin-bottom:10px">
          <div align="center" class="th-font18"> <span>广东玉兰集团股份有限公司采购单（<span
                class="th-font18color">{{ pur_headForm.PUR_NO }} </span>）</span></div>

        </div>
        <div>
          <h4 style="font-weight:normal">收货人：{{ pur_headForm.LINKMAN }}
            &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;日期： {{pur_headForm.DATE_PUR | datatrans }}</h4>
        </div>
        <div style="margin-bottom:10px">
          <h4 style="font-weight:normal">备注信息：{{ pur_headForm.NOTES }}</h4>
        </div>
        <hr />
        <div style="width:100%">
          <el-table :data="gridData" border class="tb_font13" cellpadding="0" style="width:100%">
            <el-table-column width="38" type="index" label=" " align="center" :index="indexMethod">
            </el-table-column>
            <el-table-column property="ITEM_NO" label="物料号" min-width="100"></el-table-column>
            <el-table-column property="MGUIGE" label="物料型号" min-width="100"></el-table-column>
            <el-table-column property="MNAME" label="名称" min-width="60"></el-table-column>
            <!--width="50" -->
            <el-table-column property="GRADE" label="规格" min-width="55"></el-table-column>
            <el-table-column property="QTY_PUR" label="数量" header-align="center" align="right" min-width="60">
            </el-table-column>
            <el-table-column label="含税单价" header-align="center" align="right" width="80">
              <template slot-scope="scope">
                <span>{{ scope.row.PRICE_TAXIN | numFilter }}</span>
              </template>
            </el-table-column>
            <el-table-column property="UNIT1" label="单位" align="center" min-width="50"></el-table-column>
            <el-table-column label="金额" header-align="center" align="right" min-width="80">
              <template slot-scope="scope">
                <span>{{ scope.row.TOTAL_MONEY | numFilter }}</span>
              </template>
            </el-table-column>
            <el-table-column property="NOTE" label="备注" min-width="50"></el-table-column>
            <el-table-column property="DATE_REQ" label="约定日期" align="center" width="88">
              <template slot-scope="scope"> <span>{{ scope.row.DATE_REQ | datatrans }}</span> </template>
            </el-table-column>
            <el-table-column label="送货日期" width="130">
              <template slot-scope="scope">
                <el-date-picker v-model="scope.row.DATE_DELIVER" align="right" type="date" format="yyyy-MM-dd"
                  value-format="yyyy-MM-dd" placeholder="选择日期">
                </el-date-picker>
              </template>
            </el-table-column>
            <el-table-column label="说明" header-align="center" width="130">
              <template slot-scope="scope">
                <el-input v-model="scope.row.SUPPLY_NOTES" clearable></el-input>
              </template>
            </el-table-column>
          </el-table>
          <el-table :data="sumMoneyCol" :show-header="false" class="tb_font14_bold" cellpadding="0" style="width:100%">
            <el-table-column width="38" property="ITEM_NO" label=" ">
            </el-table-column>
            <el-table-column property="ITEM_NO" label="物料号" min-width="100"></el-table-column>
            <el-table-column property="MGUIGE" label="物料型号" min-width="100"></el-table-column>
            <el-table-column property="MNAME" label="名称" min-width="60"></el-table-column>
            <!--width="50" -->
            <el-table-column property="GRADE" label="规格" min-width="55"></el-table-column>
            <el-table-column property="QTY_PUR" label="数量" header-align="center" align="right" min-width="60">
            </el-table-column>
            <el-table-column label="含税单价" header-align="center" align="right" width="80"></el-table-column>
            <el-table-column property="UNIT1" label="单位" align="center" min-width="50">汇总 </el-table-column>
            <el-table-column label="金额" align="right" min-width="80"> <template slot-scope="scope">
                <span>{{ scope.row.name8 | numFilter }}</span>
              </template></el-table-column>
            <el-table-column property="NOTE" label="备注" min-width="50"></el-table-column>
            <el-table-column property="DATE_REQ" label="约定日期" align="center" width="88"></el-table-column>
            <el-table-column property="DATE_DELIVER" label="送货日期" width="130"> </el-table-column>
            <el-table-column property="SUPPLY_CHECK_NOTES" label="说明" min-width="130"></el-table-column> >
          </el-table>

          <hr />
          <div style="margin-top:10px">
            <div style="margin-bottom:10px;width:100%" class="data_1">
              <el-card style="min-height:100px">
                <div>
                  <span class="th-font16">送货日期:</span>
                  <el-date-picker v-model="date_deliver" type="date" format="yyyy-MM-dd" value-format="yyyy-MM-dd"
                    placeholder="选择时间" style="width:18%"></el-date-picker>
                  <el-button style="width:16%" class="button_clolur" @click="Unitdeliver">统一设置送货期</el-button>
                  <el-button style="width:16%;margin-top:10px" class="button_clolur" @click="AllAccordPromise">全部设为约定日期
                  </el-button>
                </div>
                <div style="margin-top:20px">
                  <span class="th-font16"> 说 &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;明:</span>
                  <el-input v-model="supply_check_notes" placeholder="说明:" style="width:42%;height:10px" clearable>
                  </el-input>
                  <el-button @click="SaveNotes()" style="width:10%;" class="button_clolur">保存说明
                  </el-button>
                </div>
              </el-card>
            </div>
          </div>
          <div>
            <el-button @click="SubmitVue" style="width:10%;margin-left:35%;margin-top:10px" type="warning" size="small">
              确认</el-button>
            <el-button @click="returnMain" style="width:10%;margin-left:5%;margin-top:10px" type="primary" size="small">
              返回</el-button>
          </div>
        </div>
      </el-dialog>
      <!-- X开头（窗帘）订单已确认采购单详情界面 -->
      <el-dialog title="" :visible.sync="checkedX_Visible" :show-close="true" :close-on-click-modal="false"
        width="1170px" top="8vh">
        <div class="fixedDiv">
          <div style="margin:20px">
            <el-button @click="returnMain" type="primary" size="small">返 &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; 回
            </el-button>
          </div>
          <div style="margin:20px">
            <el-button @click="downLoadX()" type="primary" size="small">导出Excel</el-button>
          </div>
          <div style="margin:20px">
            <el-button @click="printRefund('checkedXPrint')" icon="el-icon-printer" type="primary" size="small">
              打&nbsp;&nbsp;&nbsp;印 </el-button>
          </div>

        </div>
        <div id="checkedXPrint" style="width:100% ;margin:0 auto;">
          <table style=" width:100% ;margin:0 auto; ">
            <tbody>
              <tr>
                <td colspan="2" style="font-family:黑体;font-size:1.6em;font-weight:bold;" align="center">
                  采购单
                </td>
              </tr>
              <tr>
                <td style="border-bottom:solid 3px gray;text-align:left">
                  订单状态
                  <span style="margin-left:font-weight:bold;">{{
                    pur_headForm.STATUS | pur_headStatus
                  }}</span>
                </td>
                <td style="border-bottom:solid 3px gray;" align="right">
                  <span style="margin-left:font-weight:bold;">打印日期：{{
                    now.getFullYear() + "-" + Month + "-" + now.getDate()
                  }}</span>
                </td>
              </tr>
              <tr>
                <td style="border-right:solid 1px gray;border-bottom:solid 3px gray;" width="50%" valign="top">
                  <table class="PUR_HEAD_COLUMNS" style="text-align:right">
                    <tbody>
                      <tr>
                        <td style="text-align:right" width="100">流水号：</td>
                        <td style="text-align:left">
                          {{ pur_headForm.PUR_NO }}
                        </td>
                      </tr>
                      <tr>
                        采购员：
                        <td style="text-align:left">
                          {{ pur_headForm.BUYER }}
                        </td>
                      </tr>
                      <tr>
                        建立日期：
                        <td style="text-align:left">
                          {{ pur_headForm.DATE_PUR | datatrans}}
                        </td>
                      </tr>
                      <tr>
                        采购商：
                        <td style="text-align:left">
                          {{ pur_headForm.PUR_MYFACT }}
                        </td>
                      </tr>
                      <tr>
                        采购商地址：
                        <td style="text-align:left">
                          {{ pur_headForm.C_ADDRESS }}
                        </td>
                      </tr>
                      <tr>
                        开户银行：
                        <td style="text-align:left">
                          {{ pur_headForm.C_BANK }}
                        </td>
                      </tr>
                      <tr>
                        邮政编码：
                        <td style="text-align:left">
                          {{ pur_headForm.C_POST }}
                        </td>
                      </tr>
                      <tr>
                        银行账号：
                        <td style="text-align:left">
                          {{ pur_headForm.C_BANKNO }}
                        </td>
                      </tr>
                      <tr>
                        税务登记号：
                        <td style="text-align:left">
                          {{ pur_headForm.C_TAX }}
                        </td>
                      </tr>
                      <tr>
                        联系电话：
                        <td style="text-align:left">
                          {{ pur_headForm.OWN_TEL }}
                        </td>
                      </tr>
                      <tr>
                        付款方式：
                        <td style="text-align:left">
                          {{ pur_headForm.PAY_TYPE }}
                        </td>
                      </tr>
                      <tr>
                        付款期限：
                        <td style="text-align:left">
                          {{ pur_headForm.PAY_DATELIMIT| datatrans }}
                        </td>
                      </tr>
                      <tr>
                        备注：
                        <td style="text-align:left">
                          {{ pur_headForm.NOTES }}
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </td>

                <td style="border-left:solid 1px gray;border-bottom:solid 3px gray;" width="50%">
                  <table class="PUR_HEAD_COLUMNS" style="text-align:right">
                    <tbody>
                      <tr>
                        <td style="text-align:right" width="100">采购部门：</td>
                        <td colsan="3" style="text-align:left">
                          {{ pur_headForm.DEPT_NO }}
                        </td>
                      </tr>
                      <tr>
                        合同号：

                        <td colsan="3" style="text-align:left">
                          {{ pur_headForm.CONTRACT_NO }}
                        </td>
                      </tr>
                      <tr>
                        供应商：
                        <td colsan="3" style="text-align:left">
                          {{ pur_headForm.SUPPLY_CODE }}
                        </td>
                      </tr>
                      <tr>
                        供应商地址：
                        <td colsan="3" style="text-align:left">
                          {{ pur_headForm.G_ADDRESS }}
                        </td>
                      </tr>
                      <tr>
                        联系人：
                        <td colsan="3" style="text-align:left">
                          {{ pur_headForm.G_LINK }}
                        </td>
                      </tr>
                      <tr>
                        传真号码：
                        <td colsan="3" style="text-align:left">
                          {{ pur_headForm.G_TYPE }}
                        </td>
                      </tr>
                      <tr>
                        电话：
                        <td colsan="3" style="text-align:left">
                          {{ pur_headForm.G_PHONE }}
                        </td>
                      </tr>
                      <tr>
                        手机：
                        <td colsan="3" style="text-align:left">
                          {{ pur_headForm.HANDSET }}
                        </td>
                      </tr>
                      <tr>
                        B2B订单号：
                        <td colsan="3" style="text-align:left">
                          {{ pur_headForm.ORDER_NO }}
                        </td>
                      </tr>
                      <tr>
                        ERP订单号：
                        <td colsan="3" style="text-align:left">
                          {{ pur_headForm.OA_NO }}
                        </td>
                      </tr>
                      <tr>
                        接单人：
                        <td colsan="3" style="text-align:left">
                          {{ pur_headForm.ORDER_MAN }}
                        </td>
                      </tr>
                    </tbody>
                  </table>
                  <table class="customerInfo" style="text-align:right">
                    <tbody>
                      <tr>
                        <td colsan="3" style="text-align:left">客户名称：{{ pur_headForm.CUSTOMER_NAME }}</td>
                      </tr>
                      <tr>
                        <td colsan="3" style="text-align:left">&nbsp;&nbsp;&nbsp;&nbsp;联系人： {{ pur_headForm.LINKMAN }}
                        </td>
                      </tr>
                      <tr>
                        <td colsan="4" style="text-align:left"> 联系电话：{{ pur_headForm.LINKTEL }}</td>
                      </tr>
                      <tr>
                        <td colsan="4" style="text-align:left">发货地址： {{ pur_headForm.POST_ADDRESS }} </td>
                      </tr>
                    </tbody>
                  </table>

                </td>
              </tr>
              <tr>
                <!-- 明明细细 -->
                <td colspan="2">
                  <el-table :data="colName" :show-header="false" border object_class="_Object:GridTable"
                    object_hashcode="6" cellpadding="0" style="width:100%" class="tb_font14_bold">
                    <af-table-column property="name1" label="位置" align="center" width="120"></af-table-column>
                    <af-table-column property="name2" label="名称" align="center" width="80"></af-table-column>
                    <af-table-column property="name3" label="编码" align="center" width="120"></af-table-column>
                    <af-table-column property="name4" label="名称" align="center" width="150"></af-table-column>
                    <af-table-column property="name5" label="规格:米/对" align="center" width="60"></af-table-column>
                    <el-table-column property="name6" label="用量" align="center" width="60"></el-table-column>
                    <el-table-column property="name7" label="含税单价" align="center" width="100"></el-table-column>
                    <el-table-column property="name8" label="金额" align="center" width="80"></el-table-column>
                    <el-table-column property="name9" label="制造说明" align="center" width="80"></el-table-column>
                    <el-table-column property="name10" label="备注" align="center" width="130"></el-table-column>
                    <el-table-column property="name11" label="生产备注" align="center"></el-table-column>
                  </el-table>
                  <div>
                    <div v-for="(item, index) of items" :key="index">
                      <!-- 已确认订单详情循环因子 -->
                      <div style="display:flex">
                        <div style="width:115px;padding: 3px">
                          <div class="messageBox1">
                            <div class="tb_font14_bold"> {{ index + 1 }} &nbsp; {{
                            item.tab1[index].cl_place === null ||
                            item.tab1[index].cl_place == ""
                              ? "无"
                              : item.tab1[index].cl_place
                          }}</div>
                          </div>
                          <div class="messageBox">
                            <div>
                              <label>款号：</label>
                              <div class="messageInput">
                                {{ item.tab1[index].cl_item_no }}
                              </div>
                            </div>
                            <div>
                              <label>成品宽：</label>
                              <div class="messageInput">
                                {{ item.tab1[index].cl_width }}
                              </div>
                              m
                            </div>
                            <div>
                              <label>成品高：</label>
                              <div class="messageInput">
                                {{ item.tab1[index].cl_high }}
                              </div>
                              m
                            </div>
                            <div>
                              <label>假帘高：</label>
                              <div class="messageInput">
                                {{ item.tab1[index].cl_high_jia }}
                              </div>
                              m
                            </div>
                            <div>
                              <label>帘倍数：</label>
                              <div class="messageInput">
                                {{ item.tab1[index].cl_size_times }}
                              </div>
                            </div>
                            <div>
                              <label>帘头外包盒单边宽:</label>
                              <div v-if=" item.tab1[index].cl_wbh_width>=0 " class="messageInput">
                                {{ item.tab1[index].cl_wbh_width }}
                              </div>
                              <div v-else class="messageInput">无</div>
                              m
                            </div>
                          </div>
                        </div>
                        <div style="flex:1;">
                          <el-table :data="item.tab2[index]" :show-header="false"
                            :span-method="function(col){ return arraySpanMethod(col,index)}" class="tb_font13" border
                            object_class="_Object:GridTable" object_hashcode="6" cellpadding="0" style="width:100%">
                            <el-table-column label="inner名称" align="center" width="80">
                              <template slot-scope="scope">{{getTypeName(scope.row.cl_name)}}</template>
                            </el-table-column>
                            <el-table-column prop="item_no" label="inner编码" width="120"></el-table-column>
                            <el-table-column prop="mname" label="inner名称" header-align="center" width="150">
                            </el-table-column>
                            <el-table-column prop="grade" label="inner规格:米/对" header-align="center" width="60">
                            </el-table-column>
                            <el-table-column label="inner用量" align="right" width="60">
                              <template slot-scope="scope">
                                {{scope.row.qty_pur}}{{scope.row.unit1}}
                              </template>
                            </el-table-column>
                            <el-table-column label="inner含税单价" header-align="center" align="right" width="100">
                              <template slot-scope="scope">
                                {{scope.row.price_taxin|numFilter}}
                              </template>
                            </el-table-column>
                            <el-table-column label="inner金额" header-align="center" align="right" width="80">
                              <template slot-scope="scope">
                                {{scope.row.total_money|numFilter}}
                              </template>
                            </el-table-column>
                            <el-table-column prop="product_note" label="inner制造说明" header-align="center" width="80">
                            </el-table-column>
                            <el-table-column prop="notes" label="inner备注" header-align="center" width="130">
                            </el-table-column>
                            <el-table-column prop="lj_product_note" label="inner生产备注" header-align="center">
                            </el-table-column>
                          </el-table>
                        </div>
                      </div>

                      <el-table class="tb_font12_bold" style="width:100%;" :show-header="false"
                        :data="item.tab3[index]">
                        <el-table-column label="预约" header-align="center" width="120"> <template slot-scope="scope">
                            {{scope.row.date_req}} </template></el-table-column>
                        <el-table-column label="交货" header-align="center" width="200"><template slot-scope="scope">
                            {{scope.row.date_deliver}} </template></el-table-column>
                        <!-- <el-table-column label="编码" header-align="center" width="130"> </el-table-column> -->
                        <!-- <el-table-column label="交货"  header-align="center" width="80"></el-table-column> -->
                        <el-table-column label="名称" header-align="center" width="150"></el-table-column>
                        <el-table-column label="规格:米/对" header-align="center" align="center" width="60">
                        </el-table-column>
                        <el-table-column label="用量" header-align="center" align="center" width="60"></el-table-column>
                        <el-table-column label="含税单价" header-align="center" align="right" width="100">
                          <template>小计</template>
                        </el-table-column>
                        <el-table-column label="金额" header-align="left" align="right" width="80">
                          <template slot-scope="scope"> {{scope.row.littleSum|numFilter}}</template>
                        </el-table-column>
                        <el-table-column label="制造说明" header-align="center" align="center" width="80"></el-table-column>
                        <el-table-column label="备注" header-align="center" align="center" width="130"></el-table-column>
                        <el-table-column label="生产备注" header-align="center" align="center"></el-table-column>
                      </el-table>
                      <!-- /已确认订单详情循环因子 -->
                    </div>
                  </div>

                  <el-table :data="sumMoneyCol" :show-header="false" object_class="_Object:GridTable"
                    object_hashcode="6" cellpadding="0" style="width:100%" class="tb_font14_bold">
                    <af-table-column property="name1" width="120" label="位置"></af-table-column>
                    <af-table-column property="name2" width="80" label="名称"></af-table-column>
                    <af-table-column property="name3" width="120" label="编码"></af-table-column>
                    <af-table-column property="name4" label="名称" width="150"></af-table-column>
                    <af-table-column property="name5" label="规格:米/对" width="60"></af-table-column>
                    <el-table-column property="name6" label="用量" width="60"></el-table-column>
                    <el-table-column property="name7" label="含税单价" width="100" header-align="center" align="right">
                    </el-table-column>
                    <el-table-column label="金额" width="80" align="right">
                      <template slot-scope="scope">
                        {{scope.row.name8|numFilter}}
                      </template>
                    </el-table-column>
                    <el-table-column property="name9" label="制造说明" width="80"></el-table-column>
                    <el-table-column property="name10" label="备注"></el-table-column>
                    <el-table-column property="name11" label="生产备注"></el-table-column>
                  </el-table>

                </td>
                <!-- 明明细细 -->
              </tr>
            </tbody>
          </table>
        </div>
      </el-dialog>
      <!-- 非X开头（窗帘）订单 已确认采购单详情界面 ==========================================================================-->
      <el-dialog id="checkedX" title="" :visible.sync="checkedY_Visible" :show-close="true"
        :close-on-click-modal="false" width="1070px" top="8vh">
        <div class="fixedDiv">
          <div style="margin:20px">
            <el-button @click="returnMain" type="primary" size="small">返 &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; 回
            </el-button>
          </div>
          <div style="margin:20px">
            <el-button @click="downLoadY()" type="primary" size="small">导出Excel</el-button>
          </div>
          <div style="margin:20px">
            <el-button @click="printRefund('checkedYPrint')" icon="el-icon-printer" type="primary" size="small">
              打&nbsp;&nbsp;&nbsp;印 </el-button>
          </div>

        </div>
        <div id="checkedYPrint" style="width:100% ;margin:0 auto;">
          <table style=" width:100% ;margin:0 auto; ">
            <tbody>
              <tr>
                <td colspan="2" style="font-family:黑体;font-size:1.6em;font-weight:bold;" align="center">采购单

                </td>
              </tr>

              <tr>
                <td style="border-bottom:solid 3px gray;text-align:left">
                  订单状态
                  <span style="margin-left:font-weight:bold;">
                    {{ pur_headForm.STATUS | pur_headStatus }}</span>
                  <div style="position:fixed;z-index:1;top: 0.5px;padding-left: 15px;background-color: #FFFFFF"></div>
                </td>
                <td style="border-bottom:solid 3px gray;" align="right">
                  <span style="margin-left:font-weight:bold;">打印日期： {{
                    now.getFullYear() + "-" + Month + "-" + now.getDate()
                  }}</span>
                </td>
              </tr>
              <tr>
                <td style="border-right:solid 1px gray;border-bottom:solid 3px gray;" width="50%" valign="top">
                  <table class="PUR_HEAD_COLUMNS" style="text-align:right">
                    <tbody>
                      <tr>
                        <td style="text-align:right" width="100">流水号：</td>
                        <td style="text-align:left">
                          {{ pur_headForm.PUR_NO }}
                        </td>
                      </tr>
                      <tr>
                        采购员：
                        <td style="text-align:left">
                          {{ pur_headForm.BUYER }}
                        </td>
                      </tr>
                      <tr>
                        建立日期：
                        <td style="text-align:left">
                          {{ pur_headForm.DATE_PUR | datatrans}}
                        </td>
                      </tr>
                      <tr>
                        采购商：
                        <td style="text-align:left">
                          {{ pur_headForm.PUR_MYFACT }}
                        </td>
                      </tr>
                      <tr>
                        采购商地址：
                        <td style="text-align:left">
                          {{ pur_headForm.C_ADDRESS }}
                        </td>
                      </tr>
                      <tr>
                        开户银行：
                        <td style="text-align:left">
                          {{ pur_headForm.C_BANK }}
                        </td>
                      </tr>
                      <tr>
                        邮政编码：
                        <td style="text-align:left">
                          {{ pur_headForm.C_POST }}
                        </td>
                      </tr>
                      <tr>
                        银行账号：
                        <td style="text-align:left">
                          {{ pur_headForm.C_BANKNO }}
                        </td>
                      </tr>
                      <tr>
                        税务登记号：
                        <td style="text-align:left">
                          {{ pur_headForm.C_TAX }}
                        </td>
                      </tr>
                      <tr>
                        联系电话：
                        <td style="text-align:left">
                          {{ pur_headForm.OWN_TEL }}
                        </td>
                      </tr>
                      <tr>
                        付款方式：
                        <td style="text-align:left">
                          {{ pur_headForm.PAY_TYPE }}
                        </td>
                      </tr>
                      <tr>
                        付款期限：
                        <td style="text-align:left">
                          {{ pur_headForm.PAY_DATELIMIT | datatrans}}
                        </td>
                      </tr>
                      <tr>
                        备注：
                        <td style="text-align:left">
                          {{ pur_headForm.NOTES }}
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </td>

                <td style="border-left:solid 1px gray;border-bottom:solid 3px gray;" width="50%">
                  <table class="PUR_HEAD_COLUMNS" style="text-align:right">
                    <tbody>
                      <tr>
                        <td style="text-align:right" width="100">采购部门：</td>
                        <td colsan="3" style="text-align:left">
                          {{ pur_headForm.DEPT_NO }}
                        </td>
                      </tr>

                      <tr>
                        合同号：

                        <td colsan="3" style="text-align:left">
                          {{ pur_headForm.CONTRACT_NO }}
                        </td>
                      </tr>
                      <tr>
                        供应商：
                        <td colsan="3" style="text-align:left">
                          {{ pur_headForm.SUPPLY_CODE }}
                        </td>
                      </tr>
                      <tr>
                        供应商地址：
                        <td colsan="3" style="text-align:left">
                          {{ pur_headForm.G_ADDRESS }}
                        </td>
                      </tr>
                      <tr>
                        联系人：
                        <td colsan="3" style="text-align:left">
                          {{ pur_headForm.G_LINK }}
                        </td>
                      </tr>
                      <tr>
                        传真号码：
                        <td colsan="3" style="text-align:left">
                          {{ pur_headForm.G_TYPE }}
                        </td>
                      </tr>
                      <tr>
                        电话：
                        <td colsan="3" style="text-align:left">
                          {{ pur_headForm.G_PHONE }}
                        </td>
                      </tr>
                      <tr>
                        手机：
                        <td colsan="3" style="text-align:left">
                          {{ pur_headForm.HANDSET }}
                        </td>
                      </tr>
                      <tr>
                        B2B订单号：
                        <td colsan="3" style="text-align:left">
                          {{ pur_headForm.ORDER_NO }}
                        </td>
                      </tr>
                      <tr>
                        ERP订单号：
                        <td colsan="3" style="text-align:left">
                          {{ pur_headForm.OA_NO }}
                        </td>
                      </tr>
                      <tr>
                        接单人：
                        <td colsan="3" style="text-align:left">
                          {{ pur_headForm.ORDER_MAN }}
                        </td>
                      </tr>

                    </tbody>
                  </table>

                  <table class="customerInfo" style="text-align:right">
                    <tbody>
                      <tr>
                        <td colsan="3" style="text-align:left"> 客户名称：{{ pur_headForm.CUSTOMER_NAME }}</td>
                      </tr>
                      <tr>
                        <td colsan="3" style="text-align:left"> &nbsp;&nbsp;&nbsp;&nbsp;联系人：{{ pur_headForm.LINKMAN }}
                        </td>
                      </tr>
                      <tr>
                        <td colsan="4" style="text-align:left"> 联系电话：{{ pur_headForm.LINKTEL }}</td>
                      </tr>
                      <tr>
                        <td colsan="4" style="text-align:left"> 发货地址：{{ pur_headForm.POST_ADDRESS }} </td>
                      </tr>
                    </tbody>
                  </table>

                </td>
              </tr>
              <tr>
                <td colspan="2">

                  <el-table :data="gridData" class="tb_font13" cellpadding="0" border style="width:100%">
                    <el-table-column width="38" type="index" label=" " align="center" :index="indexMethod">
                    </el-table-column>
                    <el-table-column property="ITEM_NO" label="物料号" align="center" min-width="100"></el-table-column>
                    <el-table-column property="MGUIGE" label="物料型号" align="center" min-width="100"></el-table-column>
                    <el-table-column property="MNAME" label="名称" header-align="center" min-width="60"></el-table-column>
                    <!--width="50" -->
                    <el-table-column property="GRADE" label="规格" header-align="center" min-width="50"></el-table-column>
                    <el-table-column property="QTY_PUR" label="数量" header-align="center" align="right" min-width="60">
                    </el-table-column>
                    <el-table-column label="含税单价" header-align="center" align="right" width="80">
                      <template slot-scope="scope">
                        <span>{{ scope.row.PRICE_TAXIN | numFilter }}</span>
                      </template>
                    </el-table-column>
                    <el-table-column property="UNIT1" label="单位" align="center" min-width="50"></el-table-column>
                    <el-table-column label="金额" header-align="center" align="right" min-width="80">
                      <template slot-scope="scope">
                        <span>{{ scope.row.TOTAL_MONEY | numFilter }}</span>
                      </template>
                    </el-table-column>
                    <el-table-column property="NOTE" label="备注" header-align="center" min-width="60"></el-table-column>
                    <el-table-column property="DATE_REQ" label="约定日期" align="center" width="88">
                      <template slot-scope="scope"> <span>{{ scope.row.DATE_REQ | datatrans }}</span> </template>
                    </el-table-column>
                    <el-table-column property="DATE_DELIVER" label="送货日期" align="center" width="100">
                      <template slot-scope="scope">
                        <span>{{ scope.row.DATE_DELIVER | datatrans }}</span>
                      </template>
                    </el-table-column>
                    <el-table-column property="SUPPLY_CHECK_NOTES" label="说明" align="center" min-width="60">
                    </el-table-column> >
                  </el-table>
                  <el-table :data="sumMoneyCol" :show-header="false" class="font14-bold" cellpadding="0"
                    style="width:100%">
                    <el-table-column width="38" property="ITEM_NO" label=" ">
                    </el-table-column>
                    <el-table-column property="ITEM_NO" label="物料号" min-width="100"></el-table-column>
                    <el-table-column property="MGUIGE" label="物料型号" min-width="100"></el-table-column>
                    <el-table-column property="MNAME" label="名称" min-width="60"></el-table-column>
                    <!--width="50" -->
                    <el-table-column property="GRADE" label="规格" min-width="50"></el-table-column>
                    <el-table-column property="QTY_PUR" label="数量" header-align="center" align="right" min-width="60">
                    </el-table-column>
                    <el-table-column label="含税单价" header-align="center" align="right" width="80"></el-table-column>
                    <el-table-column property="UNIT1" label="单位" min-width="50">汇总</el-table-column>
                    <el-table-column label="金额" min-width="80" align="right"> <template slot-scope="scope">
                        <span>{{ scope.row.name8 | numFilter }}</span>
                      </template></el-table-column>
                    <el-table-column property="NOTE" label="备注" min-width="60"></el-table-column>
                    <el-table-column property="DATE_REQ" label="约定日期" align="center" width="88"></el-table-column>
                    <el-table-column property="DATE_DELIVER" label="送货日期" width="100"> </el-table-column>
                    <el-table-column property="SUPPLY_CHECK_NOTES" label="说明" min-width="60"></el-table-column> >
                  </el-table>
                  <!-- <div><el-button @click="downLoadY()" type="primary" size="small">导出Excel</el-button> </div> -->
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </el-dialog>

      <div class="lanJuport1">
        <el-tabs v-model="activeName" @tab-click="handleClick">
          <!-- 待确认页签============================================================================================================== -->
          <el-tab-pane label="待确认" name="first" align="left">
            <div style="margin-bottom:10px;">
              <el-input @keyup.enter.native="SelectByPo()" prefix-icon="el-icon-search" placeholder=" 采购单号:（模糊）"
                v-model="po" style="width:160px;" clearable>
              </el-input>
              <el-date-picker v-model="date1" placeholder="开始时间" align="right" type="date" format="yyyy-MM-dd"
                value-format="yyyy-MM-dd" style="width:140px;">
              </el-date-picker>
              <span class="demonstration">至</span>
              <el-date-picker v-model="date2" placeholder="结束时间" align="right" type="date" format="yyyy-MM-dd"
                value-format="yyyy-MM-dd" style="width:140px;"></el-date-picker>
              <el-select v-model="selvalue" @change="SelectClick" placeholder="全部" style="width:120px;">
                <el-option v-for="item in options" :key="item.value" :label="item.label" :value="item.value">
                </el-option>
              </el-select>
              <el-button @click="SelectClick()" size="small" style="margin-left:8px" class="button_2">搜索</el-button>
              <el-button @click="OneStepCheck()" size="small" style="margin-left:8px" class="button_3">批量确认</el-button>
            </div>
            <el-table @selection-change="handleSelectionChange" class="th-font14" border :data="pur_headData"
              style="width: 100%" highlight-current-row>
              <el-table-column type="selection" width="55">
              </el-table-column>
              <el-table-column type="index" label=" " :index="indexMethod">
              </el-table-column>
              <el-table-column prop="PUR_NO" align="center" width="100" label="单号"></el-table-column>
              <el-table-column prop="CUSTOMER_NAME" min-width="150" label="客户名称" header-align="center" align="left">
              </el-table-column>
              <el-table-column label="状态" width="60" align="center">
                <template slot-scope="scope">
                  <span>{{ scope.row.STATUS | pur_headStatus }}</span>
                </template>
              </el-table-column>
              <el-table-column label="产品类型" width="90" align="center">
                <template slot-scope="scope">
                  <span>{{ getProductType(scope.row.ORDER_NO) }}</span>
                </template>
              </el-table-column>
              <el-table-column prop="DATE_PUR" width="100" label="建立日期" align="center">
                <template slot-scope="scope">
                  <span>{{ scope.row.DATE_PUR | datatrans }}</span></template>
              </el-table-column>
              <el-table-column prop="NOTES" min-width="200" header-align="center" label="备注" align="left">
              </el-table-column>
              <el-table-column prop="LJ_SUGGESTION" label="兰居备注" min-width="50" align="left"></el-table-column>
              <el-table-column label="" width="120" align="center">
                <template slot-scope="scope">
                  <button @click="autoSearchDetail(scope.row.PUR_NO)" class="btn-style">
                    前往确认
                  </button>
                </template>
              </el-table-column>
            </el-table>
          </el-tab-pane>
          <!-- 采购单已确认页签============================================================================================================== -->
          <el-tab-pane label="采购已确认" name="second" align="left">
            <div style="margin-bottom:10px;">
              <el-input @keyup.enter.native="SelectByCustomer()" prefix-icon="el-icon-search" placeholder=" 客户(输入后回车)"
                v-model="customer" style="width:160px;" clearable>
              </el-input>
              <el-input @keyup.enter.native="SelectByPo()" prefix-icon="el-icon-search" placeholder=" 采购单号:（模糊）"
                v-model="po" style="width:160px;" clearable>
              </el-input>
              <el-date-picker v-model="date1" placeholder="开始时间" align="right" type="date" format="yyyy-MM-dd"
                value-format="yyyy-MM-dd" style="width:140px;">
              </el-date-picker>
              <span class="demonstration">至</span>
              <el-date-picker v-model="date2" placeholder="结束时间" align="right" type="date" format="yyyy-MM-dd"
                value-format="yyyy-MM-dd" style="width:140px;"></el-date-picker>
              <el-select style="width:120px" v-model="selvalue" @change="SelectClick" placeholder="全部">
                <el-option v-for="item in options" :key="item.value" :label="item.label" :value="item.value">
                </el-option>
              </el-select>
              <el-button @click="SelectClick()" size="small" style="margin-left:8px" class="button_2">搜索</el-button>
              <el-button @click="downLoadAll()" size="small" style="margin-left:8px" class="button_1">下载表头及明细
              </el-button>
              <el-button @click="downLoadSal()" size="small" style="margin-left:8px" class="button_1">下载销售表单</el-button>
              <el-button @click="checkNoPrint()" size="small" style="margin-left:8px" class="button_1">查看全部未打印
              </el-button>

            </div>
            <el-table border @selection-change="handleSelectionChange" :data="pur_headData" class="th-font14"
              style="width: 100%" cellpadding="0" highlight-current-row>
              <el-table-column label=" " type="index" :index="indexMethod">
              </el-table-column>
              <el-table-column prop="PUR_NO" width="100" label="单号" align="center"></el-table-column>
              <el-table-column prop="CUSTOMER_NAME" min-width="150" header-align="center" label="客户名称" align="left">
              </el-table-column>
              <el-table-column label="状态" width="60" align="center">
                <template slot-scope="scope"><span>{{
                      scope.row.STATUS | pur_headStatus
                    }}</span></template>
              </el-table-column>
              <el-table-column label="产品类型" width="90" align="center">
                <template slot-scope="scope">
                  <span>{{ getProductType(scope.row.ORDER_NO) }}</span>
                </template>
              </el-table-column>
              <el-table-column fomate="yyyy-MM-dd" width="100" label="建立日期" align="center">
                <template slot-scope="scope">
                  <span>{{ scope.row.DATE_PUR | datatrans }}</span>
                </template>
              </el-table-column>
              <el-table-column prop="NOTES" min-width="200" header-align="center" label="备注" align="left">
              </el-table-column>
              <el-table-column prop="LJ_SUGGESTION" label="兰居备注" min-width="50" align="left"></el-table-column>
              <el-table-column label="操作" width="100" align="center">
                <template slot-scope="scope">
                  <button @click="autoSearchDetail(scope.row.PUR_NO)" class="btn-style">查看详情</button>
                </template>
              </el-table-column>
              <el-table-column width="100" label="同步标记" prop="IMPORT_FLAG" align="center">
                <template slot-scope="scope">
                  <span v-if="scope.row.ORDER_NO.substring(0, 1) != 'X'"></span>
                  <span v-else-if="scope.row.IMPORT_FLAG == 'Y'">已同步</span>
                  <button v-else class="btn-style" @click="onClickAsync(scope.row)">同步订单</button>
                </template>
              </el-table-column>
              <el-table-column width="100" label="打印标记" prop="PRINTED" align="center">
                <template slot-scope="scope">
                  <el-checkbox @change="changePrinted(scope.row, scope.$index)" v-model="scope.row.PRINTED">
                    {{ scope.row.PRINTED === false ? "未打印" : "已打印" }}
                  </el-checkbox>
                </template>
              </el-table-column>
            </el-table>
          </el-tab-pane>
          <!-- 已取消页签============================================================================================================== -->
          <el-tab-pane label="已取消" name="third" align="left">
            <div style="margin-bottom:10px;">
              <el-input @keyup.enter.native="SelectByPo()" prefix-icon="el-icon-search" placeholder=" 采购单号:（模糊）"
                v-model="po" style="width:160px;" clearable>
              </el-input>
              <el-date-picker v-model="date1" placeholder="开始时间" align="right" type="date" format="yyyy-MM-dd"
                value-format="yyyy-MM-dd" style="width:140px;">
              </el-date-picker>
              <span class="demonstration">至</span>
              <el-date-picker v-model="date2" placeholder="结束时间" align="right" type="date" format="yyyy-MM-dd"
                value-format="yyyy-MM-dd" style="width:140px;"></el-date-picker>
              <el-button @click="SelectClick()" size="small" style="margin-left:8px" class="button_2">搜索</el-button>

            </div>
            <el-table border :data="pur_headData" class="th-font14" style="width: 100% margin:6px" cellpadding="0"
              highlight-current-row>
              <el-table-column label=" " type="index" :index="indexMethod">
              </el-table-column>
              <el-table-column prop="PUR_NO" width="100" header-align="center" label="单号" align="left">
              </el-table-column>
              <el-table-column prop="CUSTOMER_NAME" min-width="150" header-align="center" label="客户名称" align="left">
              </el-table-column>
              <el-table-column label="状态" width="60" align="center">
                <template slot-scope="scope"><span>{{
                      scope.row.STATUS | pur_headStatus
                    }}</span></template>
              </el-table-column>
              <el-table-column label="产品类型" width="90" align="center">
                <template slot-scope="scope">
                  <span>{{ getProductType(scope.row.ORDER_NO) }}</span>
                </template>
              </el-table-column>
              <el-table-column fomate="yyyy-MM-dd" width="100" label="建立日期" align="center">
                <template slot-scope="scope">
                  <span>{{ scope.row.DATE_PUR | datatrans }}</span>
                </template>
              </el-table-column>
              <el-table-column prop="NOTES" min-width="200" label="备注" header-align="center" align="left">
              </el-table-column>
              <el-table-column prop="LJ_SUGGESTION" label="兰居备注" min-width="50" align="left"></el-table-column>
              <el-table-column label="操作" width="120" align="center">
                <template slot-scope="scope">
                  <button @click="autoSearchDetail(scope.row.PUR_NO)" class="btn-style">查看详情</button>
                </template>
              </el-table-column>
            </el-table>
          </el-tab-pane>
          <!-- 退货已确认页签============================================================================================================== -->
          <el-tab-pane label="退货已确认" name="forth" align="left">
            <div style="margin-bottom:10px;">
              <el-input @keyup.enter.native="SelectByCustomer()" prefix-icon="el-icon-search" placeholder=" 客户(输入后回车)"
                v-model="customer" style="width:160px;" clearable>
              </el-input>
              <el-input @keyup.enter.native="SelectByPo()" prefix-icon="el-icon-search" placeholder=" 采购单号:（模糊）"
                v-model="po" style="width:160px;" clearable>
              </el-input>
              <el-date-picker v-model="date1" placeholder="开始时间" align="right" type="date" format="yyyy-MM-dd"
                value-format="yyyy-MM-dd" style="width:140px;">
              </el-date-picker>
              <span class="demonstration">至</span>
              <el-date-picker v-model="date2" placeholder="结束时间" align="right" type="date" format="yyyy-MM-dd"
                value-format="yyyy-MM-dd" style="width:140px;"></el-date-picker>
              <el-select style="width:120px" v-model="selvalue" @change="SelectClick" placeholder="全部">
                <el-option v-for="item in options" :key="item.value" :label="item.label" :value="item.value">
                </el-option>
              </el-select>
              <el-button @click="SelectClick()" size="small" style="margin-left:8px" class="button_2">搜索</el-button>
              <el-button @click="downLoadAll()" size="small" style="margin-left:8px" class="button_1">下载表头及明细
              </el-button>
              <el-button @click="checkNoPrint()" size="small" style="margin-left:8px" class="button_1">查看全部未打印
              </el-button>
            </div>
            <el-table border @selection-change="handleSelectionChange" :data="pur_headData" class="th-font14"
              style="width: 100%" cellpadding="0" highlight-current-row>
              <el-table-column label=" " type="index" :index="indexMethod">
              </el-table-column>
              <el-table-column prop="PUR_NO" width="100" label="单号" align="center"></el-table-column>
              <el-table-column prop="CUSTOMER_NAME" min-width="150" header-align="center" label="客户名称" align="left">
              </el-table-column>
              <el-table-column label="状态" width="60" align="center">
                <template slot-scope="scope"><span>{{
                      scope.row.STATUS | pur_headStatus
                    }}</span></template>
              </el-table-column>
              <el-table-column label="产品类型" width="90" align="center">
                <template slot-scope="scope">
                  <span>{{ getProductType(scope.row.ORDER_NO) }}</span>
                </template>
              </el-table-column>
              <el-table-column fomate="yyyy-MM-dd" width="100" label="建立日期" align="center">
                <template slot-scope="scope">
                  <span>{{ scope.row.DATE_PUR | datatrans }}</span>
                </template>
              </el-table-column>
              <el-table-column prop="NOTES" min-width="200" header-align="center" label="备注" align="left">
              </el-table-column>
              <el-table-column prop="LJ_SUGGESTION" label="兰居备注" min-width="50" align="left"></el-table-column>
              <el-table-column label="操作" width="120" align="center">
                <template slot-scope="scope">
                  <button @click="autoSearchDetail(scope.row.PUR_NO)" class="btn-style">查看详情</button>
                </template>
              </el-table-column>
              <el-table-column width="100" label="打印标记" prop="PRINTED" align="center">
                <template slot-scope="scope">
                  <el-checkbox @change="changePrinted(scope.row, scope.$index)" v-model="scope.row.PRINTED">
                    {{ scope.row.PRINTED === false ? "未打印" : "已打印" }}
                  </el-checkbox>
                </template>
              </el-table-column>
            </el-table>
          </el-tab-pane>
          <div style="margin:0 25%;" class="block">
            <el-pagination @size-change="handleSizeChange" @current-change="handleCurrentChange"
              :current-page.sync="currentPage" :page-sizes="[5, 10, 15, 20]" :page-size="limit"
              layout="total,sizes, prev, pager, next, jumper" :total="count"></el-pagination>
          </div>
        </el-tabs>
      </div>
    </el-card>
  </div>
</template>

<script>
import {
  GetPoDetail,
  GetRelativePo,
  SaveHeadNotes,
  Submit,
  SubmitX,
  UpdateCheckFlagBatch,
  UpdatePrintedById,
  GetNoPrinted,
  AsyncBuJingLing,
  GetBJLData,
} from "@/api/supplierASP";
import { downLoadFile } from "@/common/js/downLoadFile";
import Cookies from "js-cookie";
import Axios from "axios";

export default {
  name: "supplyJuPort",
  data() {
    return {
      bill_type: "POT",
      arr_index: [],
      arr_span: [],
      multipleSelection: [],
      colName: [
        {
          name1: "位置",
          name2: "名称",
          name3: "编码",
          name4: "名称",
          name5: "规格",
          name6: "用量",
          name7: "含税单价",
          name8: "金额",
          name9: "制造说明",
          name10: "备注",
          name11: "生产备注",
        },
      ],
      sumMoneyCol: [
        {
          name7: "总金额:",
          name8: 0,
        },
      ],
      int_add: 1,
      companyId: Cookies.get("companyId"),
      current_id: Cookies.get("cid"),
      sumMoney: 0,
      items: [],
      po: "",
      customer: "",
      date1: this.getPastMonth(),
      date2: new Date(),
      now: new Date(),
      Month: new Date().getMonth() + 1,
      input: "",
      selvalue: "all",
      date_deliver: "",
      batchdate_deliver: "",
      batchTip_Visible: false,
      checkX_Visible: false,
      checkY_Visible: false,
      checkedX_Visible: false,
      checkedY_Visible: false,
      supply_check_notes: "",
      gridData: [],
      po_type: "all",
      limit: 15,
      count: 0,
      currentPage: 1,
      activeName: "first",
      count: 0,
      check_flag: 0,
      pur_headData: [],
      pur_headForm: {},
      options: [
        { value: "all", label: "所有状态" },
        // { value: "cancel", label: "取消" },
        { value: "efficient", label: "生效" },
        { value: "enforce", label: "执行" },
        { value: "fulfill", label: "完成" },
      ],
      //存一行的数据
      detailData: [{ cl_place: -1, cl_item_no: "D13445435" }],
    };
  },
  methods: {
    //修改打印标记
    changePrinted(value, index) {
      UpdatePrintedById({
        id: value.PUR_NO,
        printed: value.PRINTED,
      });
    },
    printRefund(id) {
      printJS({
        printable: id,
        type: "html",
        maxWidth: 1300,
        headerStyle: "margin: -2px;",
        targetStyles: ["*"],
      });
    },
    //合并行或列
    arraySpanMethod({ row, column, rowIndex, columnIndex }, index) {
      if (columnIndex === 0) {
        //特别注意：查询出那列就合并那列，index别写成别的列
        if (this.arr_index[index].indexOf(rowIndex) > -1) {
          var i = this.arr_index[index].indexOf(rowIndex);
          return [this.arr_span[index][i], 1];
        } else
          return {
            rowspan: 0,
            colspan: 0,
          };
      }
    },
    //选择或输入条件后搜索
    OneStepCheck() {
      if (this.multipleSelection.length == 0) {
        this.$alert("未选定任何项！", "提示", {
          confirmButtonText: "确定",
          type: "warning",
        });
      } else {
        // this.batchTip_Visible=true;
        // let arr_pur=[];
        // for(let i=0; i<this.multipleSelection.length;i++){
        //   arr_pur.push(this.multipleSelection[i].PUR_NO);
        // }
        var data = {
          arr_pur: this.multipleSelection,
          batchdate_deliver: this.batchdate_deliver,
        };
        UpdateCheckFlagBatch(data)
          .then(async (res) => {
            this.$alert("批量确认成功", "提示", {
              confirmButtonText: "确定",
              type: "success",
            });
            this.batchTip_Visible = false;
            //同步到布精灵
            await this.asyncBuJingLing(res.data);
            this.autoSearch();
          })
          .catch((res) => {
            this.$alert("批量确认失败，请稍后重试", "提示", {
              confirmButtonText: "确定",
              type: "warning",
            });
          });
      }
    },
    BatchSure() {
      let arr_pur = [];
      for (let i = 0; i < this.multipleSelection.length; i++) {
        arr_pur.push(this.multipleSelection[i].PUR_NO);
      }
      var data = {
        arr_pur: arr_pur,
        batchdate_deliver: this.batchdate_deliver,
      };
      UpdateCheckFlagBatch(data)
        .then((res) => {
          this.$alert("批量确认成功", "提示", {
            confirmButtonText: "确定",
            type: "success",
          });
          this.batchTip_Visible = false;
          this.autoSearch();
        })
        .catch((res) => {
          this.$alert("批量确认失败，请稍后重试", "提示", {
            confirmButtonText: "确定",
            type: "warning",
          });
        });
    },
    handleSelectionChange(val) {
      this.multipleSelection = val;
    },
    datatransMethod(value) {
      //时间戳转化大法
      if (value == null || value == "") {
        return "";
      }
      let date = new Date(value);
      let y = date.getFullYear();
      if (y > 5000) {
        return "";
      }
      let MM = date.getMonth() + 1;
      MM = MM < 10 ? "0" + MM : MM;
      let d = date.getDate();
      d = d < 10 ? "0" + d : d;
      let h = date.getHours();
      h = h < 10 ? "0" + h : h;
      let m = date.getMinutes();
      m = m < 10 ? "0" + m : m;
      let s = date.getSeconds();
      s = s < 10 ? "0" + s : s;
      return y + "-" + MM + "-" + d + " "; /* + h + ':' + m + ':' + s; */
    },
    //获取窗帘大类名称
    getTypeName(val) {
      switch (val) {
        case "lt":
          return "帘头";
        case "ls":
          return "帘身";
        case "lspb":
          return "帘身配布";
        case "sha":
          return "纱";
        case "pjb":
          return "配件";
        default:
          return "暂无名称";
      }
    },
    //获取产品类型
    getProductType(value) {
      if (value.substring(0, 1) == "X") {
        return "窗帘";
      } else if (value.substring(0, 1) == "Y") {
        return "软装";
      } else if (value.substring(0, 1) == "W") {
        return "墙纸配套类";
      } else return "手工单";
    },
    getBegintime(value) {
      var startTime = null;
      if (value == null || value == "") {
        startTime = new Date();
        let longtime = 100 * 365 * 24 * 3600 * 1000;
        startTime -= longtime;
        startTime = new Date(startTime);
        startTime.setHours(0, 0, 0);
      } else {
        startTime = new Date(value);
        startTime.setHours(0, 0, 0);
      }
      var date = this.datatransMethod(startTime);
      return date;
    },
    getEndtime(value) {
      var endTime = null;
      if (value == null || value == "") {
        endTime = new Date();
        let longtime = 100 * 365 * 24 * 3600 * 1000;
        endTime += longtime;
        endTime = new Date(endTime);
        endTime.setHours(23, 59, 59);
      } else {
        endTime = new Date(value);
        endTime.setHours(23, 59, 59);
      }
      var date = this.datatransMethod(endTime);
      return date;
    },
    //获取最近一周时间
    getCurrentWeek() {
      var date = new Date();
      date.setDate(date.getDate() - 30); //改成了最近一个月
      date.setHours(0, 0, 0);
      return date;
    },
    //获取最近三十天时间
    getPastMonth() {
      var date = new Date();
      date.setDate(date.getDate() - 30);
      date.setHours(0, 0, 0);
      return date;
    },
    //获取截止时间一天中的最后时间
    getTodayMaxTime() {
      var date = new Date();
      date.setHours(23, 59, 59);
      return date;
    },
    //统一送货日期
    Unitdeliver() {
      if (this.date_deliver == "") {
        this.$alert("请选择一个统一的时间！", "提示", {
          confirmButtonText: "好的",
          type: "warning",
        });
        return;
      }
      for (let i = 0; i < this.gridData.length; i++) {
        this.gridData[i].DATE_DELIVER = this.date_deliver;
      }
    },
    //全部按约定日期
    AllAccordPromise() {
      for (let i = 0; i < this.gridData.length; i++) {
        this.gridData[i].DATE_DELIVER = this.gridData[i].DATE_REQ;
      }
    },
    //选择或输入条件后搜索
    SelectByCustomer() {
      if (
        this.customer != null &&
        this.customer != "" &&
        this.customer != "all"
      ) {
        this.date1 = null;
        this.date2 = null;
        this.po = "";
        this.selvalue = "all";
      } else if (this.date1 == null && this.date2 == null) {
        this.date1 = new Date(this.getPastMonth());
        this.date2 = new Date();
      }
      this.currentPage = 1;
      this.po_type = this.selvalue;
      this.autoSearch();
    },
    SelectByPo() {
      if (this.po != "") {
        this.date1 = null;
        this.date2 = null;
        this.customer = null;
      } else if (this.date1 == null && this.date2 == null) {
        this.date1 = new Date(this.getPastMonth());
        this.date2 = new Date();
      }

      this.currentPage = 1;
      this.po_type = this.selvalue;
      this.autoSearch();
    },
    SelectClick() {
      if (this.date1 == null && this.date2 == null) {
        this.date1 = new Date(this.getPastMonth());
        this.date2 = new Date();
      }
      this.currentPage = 1;
      this.po_type = this.selvalue;
      this.autoSearch();
    },
    //标签页切换
    handleClick(tab) {
      var tabName = tab.name;
      this.currentPage = 1;
      switch (tabName) {
        case "first":
          this.bill_type = "POT";
          this.check_flag = 0;
          this.selvalue = "all";
          this.po_type = "all";
          this.po = "";
          this.date1 = this.getPastMonth();
          this.date2 = this.getTodayMaxTime();
          break;
        case "second":
          this.bill_type = "PO";
          this.check_flag = 1;
          this.selvalue = "all";
          this.po_type = "all";
          this.po = "";
          this.date1 = this.getCurrentWeek();
          this.date2 = this.getTodayMaxTime();
          break;
        case "third":
          this.bill_type = "POT";
          this.check_flag = -99;
          this.selvalue = "cancel";
          this.po_type = "cancel";
          this.po = "";
          this.date1 = this.getCurrentWeek();
          this.date2 = this.getTodayMaxTime();
          break;
        case "forth":
          this.bill_type = "PT";
          this.check_flag = -99;
          this.selvalue = "all";
          this.po_type = "all";
          this.po = "";
          this.date1 = this.getCurrentWeek();
          this.date2 = this.getTodayMaxTime();
          break;
      }
      this.autoSearch();
    },
    //首列序号自定义
    indexMethod(index) {
      return index + 1;
    },
    //页面条数
    handleSizeChange(val) {
      this.limit = val;
      this.currentPage = 1;
      this.autoSearch();
    },
    //翻页获取订单
    handleCurrentChange(val) {
      this.currentPage = val;
      this.autoSearch();
    },
    SaveNotes() {
      var data = {
        PUR_NO: this.pur_headForm.PUR_NO,
        NOTE: this.supply_check_notes,
      };
      SaveHeadNotes(data)
        .then((res) => {
          this.autoSearch();
          this.checkX_Visible = false;
          this.checkY_Visible = false;
        })
        .catch((res) => {
          this.$alert("保存失败，请稍后重试", "提示", {
            confirmButtonText: "确定",
            type: "warning",
          });
        });
    },
    returnMain() {
      this.checkY_Visible = false;
      this.checkX_Visible = false;
      this.checkedY_Visible = false;
      this.checkedX_Visible = false;
    },
    //确认之前要检查是否填好必要的信息
    SubmitVue() {
      this.pur_headForm.SUPPLY_CHECK_NOTES = this.supply_check_notes;
      if (this.pur_headForm.ORDER_NO.substring(0, 1) == "X") {
        let data = {
          pur_headForm: this.pur_headForm,
          date_deliver: this.date_deliver,
        };
        if (
          this.date_deliver == "9999/12/31 00:00:00" ||
          this.date_deliver == ""
        ) {
          this.$alert("送货日期不能为空！", "提示", {
            confirmButtonText: "好的",
            type: "warning",
          });
          return;
        }
        SubmitX(data, { loading: false })
          .then(async (res) => {
            this.checkX_Visible = false;
            //同步布精灵数据
            if (res.data.length) {
              await this.asyncBuJingLing([
                { PUR_NO: res.data[0].PUR_NO, data: res.data },
              ]);
            }
            this.checkedX_Visible = true;
            this.autoSearch();
          })
          .catch((res) => {
            this.$alert("确认失败，请稍后重试", "提示", {
              confirmButtonText: "确定",
              type: "warning",
            });
          });
      } else {
        for (let i = 0; i < this.gridData.length; i++) {
          if (
            this.gridData[i].DATE_DELIVER == "9999/12/31 00:00:00" ||
            this.gridData[i].DATE_DELIVER == ""
          ) {
            this.$alert("送货日期不能为空！", "提示", {
              confirmButtonText: "好的",
              type: "warning",
            });
            return;
          }
        }
        let data = {
          pur_headForm: this.pur_headForm,
          gridData: this.gridData,
        };
        Submit(data, { loading: false })
          .then((res) => {
            this.checkY_Visible = false;
            this.checkedY_Visible = true;
            this.autoSearch();
          })
          .catch((res) => {
            this.$alert("确认失败，请稍后重试", "提示", {
              confirmButtonText: "确定",
              type: "warning",
            });
          });
      }
    },
    //单列的groupby
    groupBy(array, name) {
      let groups = [];
      array.forEach((item) => {
        let groupName = item[name];
        var hasgroup = groups.filter((item) => item.group == groupName);
        if (hasgroup.length) {
          hasgroup[0].value.push(item);
        } else {
          groups.push({
            group: groupName,
            value: [item],
          });
        }
      });
      return groups;
    },
    //手动同步布精灵
    onClickAsync(row) {
      this.$confirm("确认同步？", "提示", {
        confirmButtonText: "是",
        cancelButtonText: "否",
        type: "warning",
      })
        .then(() => {
          GetBJLData({ PUR_NO: row.PUR_NO }).then(async (res) => {
            if (res.data.length) {
              await this.asyncBuJingLing([
                { PUR_NO: row.PUR_NO, data: res.data },
              ]);
              this.autoSearch();
            } else {
              this.$alert("查找数据错误", "提示", {
                confirmButtonText: "确定",
                type: "warning",
              });
            }
          });
        })
        .catch(() => {});
    },
    //同步布精灵数据
    async asyncBuJingLing(pruData) {
      var result = "";
      if (pruData.length) {
        var loading = this.$loading({
          lock: true,
          text: "正在同步...",
          target: document.querySelector(".loading-area"), //设置加载动画区域
        });
        var failPur = "";
        for (var i = 0; i < pruData.length; i++) {
          //一个单n个位置的窗帘就要post n次
          var onedata = pruData[i].data;
          var oneFail = "";
          if (onedata.length) {
            //通过位置查找窗帘
            var placeList = this.groupBy(onedata, "CL_PLACE_ID");
            for (var p = 0; p < placeList.length; p++) {
              var oneplace = placeList[p].value;
              //每个窗帘post数据
              var detailData = [];
              for (var d = 0; d < oneplace.length; d++) {
                var detail = oneplace[d];
                var onedetail = {
                  buwei: detail.CL_NAME,
                  leibie: detail.MNAME,
                  code: detail.ITEM_NO,
                  danwei: detail.UNIT_NAME,
                  price: detail.PRICE_TAXIN,
                  guige: detail.FIX_GRADE,
                  shuliang: detail.QTY_PUR,
                  shenhe2Des: detail.PRODUCT_NOTE,
                  beizhu: detail.NOTES,
                };
                detailData.push(onedetail);
              }
              //找各种款式
              var ltlist = oneplace.filter((item) => item.CL_NAME == "lt");
              var lslist = oneplace.filter((item) => item.CL_NAME == "ls");
              var shalist = oneplace.filter((item) => item.CL_NAME == "sha");

              var postdata = {
                token: "ljsp-bjl",
                cpPlaceId: detail.CL_PLACE_ID,
                custmorname: oneplace[0].CUSTOMER_NAME,
                sortname: oneplace[0].CUSTOMER_CODE,
                tempCustmorjc: oneplace[0].LINKMAN,
                tempPhone: oneplace[0].LINKTEL,
                tempAddress: oneplace[0].POST_ADDRESS,
                templatename: oneplace[0].CL_ITEM_NO,
                liantou: ltlist.length > 0,
                lianshen: lslist.length > 0,
                chuangsha: shalist.length > 0,
                liantouHeight: null,
                liantouWidth: oneplace[0].QTY_PUR,
                liantouLeft: 0,
                liantouRight: 0,
                liantouMoshutie: "--",
                lianshenHeight: oneplace[0].CL_HIGH,
                lianshenWidth: oneplace[0].CL_WIDTH,
                lianshenOpen: "--",
                lianshenType: "--",
                chuangshaHeight: oneplace[0].CL_HIGH,
                chuangshaWidth: oneplace[0].CL_WIDTH,
                chuangshaOpen: "--",
                chuangshaType: "--",
                subcustmorname: detail.PUR_NO,
                zswz: oneplace[0].CL_PLACE,
                onlineDanhao: oneplace[0].ORDER_NO,
                data: JSON.stringify(detailData),
              };
              Axios.defaults.withCredentials = false;
              try {
                var resB = await Axios.post(
                  "http://ljsp.ubxiu.com:8098/syn/add",
                  //"http://buyisoft.utools.club/syn/add",
                  postdata,
                  { params: postdata, loading: false }
                );
                if (resB.data.state == "ok") {
                } else {
                  var msg =
                    pruData[i].PUR_NO +
                    "位置:" +
                    oneplace[0].CL_PLACE +
                    "同步失败;";
                  failPur += msg;
                  oneFail += msg;
                }
              } catch (err) {
                this.$message({
                  message: "同步失败!",
                  type: "error",
                  duration: 1000,
                });
                return;
              }
            }
          }
          if (!oneFail) {
            //一个单同步成功的修改同步状态
            var resC = await AsyncBuJingLing(
              { PUR_NO: pruData[i].PUR_NO },
              { loading: false }
            );
          }
        }
        loading.close();
        if (failPur) {
          this.$alert(failPur, "提示", {
            confirmButtonText: "确定",
            type: "warning",
          });
        } else {
          this.$message({
            message: "同步完成!",
            type: "success",
            duration: 1000,
          });
        }
      }
    },
    autoSearch() {
      var data = {
        limit: this.limit,
        page: this.currentPage,
        current_id: Cookies.get("cid"),
        customer:
          this.customer == null || this.customer == "" ? "all" : this.customer,
        po_type: this.po_type, //  status状态   cancel    efficient 生效（新采购单）   enforce 已执行（已确认）   fulfill 已完成
        check_flag: this.check_flag,
        beginTime: this.getBegintime(this.date1),
        finishTime: this.getEndtime(this.date2),
        po: this.po,
        bill_type: this.bill_type,
      };
      GetRelativePo(data).then(
        (res) => {
          this.count = res.count;
          this.pur_headData = res.data;
          this.pur_headData.forEach((item) => {
            item.PRINTED = item.PRINTED === "1" ? true : false;
          });
        }
        //传入参数控制页面是否loading
      );
    },
    //查询未打印的单据
    checkNoPrint() {
      var data = {
        limit: this.limit,
        page: this.currentPage,
        current_id: Cookies.get("cid"),
      };
      GetNoPrinted(data).then((res) => {
        this.count = res.count;
        this.pur_headData = res.data;
        this.pur_headData.forEach((item) => {
          item.PRINTED = item.PRINTED === "1" ? true : false;
        });
      });
    },
    downLoadSal() {
      var current_id = Cookies.get("cid");
      var customer =
        this.customer == null || this.customer == "" ? "all" : this.customer;
      var po_type = this.po_type; //  status状态   cancel    efficient 生效（新采购单）   enforce 已执行（已确认）   fulfill 已完成
      var check_flag = 1;
      var beginTime = this.getBegintime(this.date1);
      var finishTime = this.getEndtime(this.date2);
      var po = this.po;

      downLoadFile(
        this.Global.baseUrl +
          `PUR_HEAD/SalExcel?current_id=${current_id}&customer=${customer}&po_type=${po_type}&check_flag=${check_flag}&beginTime=${beginTime}&finishTime=${finishTime}&po=${po}`
      );
    },
    downLoadX() {
      var PUR_NO = this.pur_headForm.PUR_NO;
      downLoadFile(
        this.Global.baseUrl + `PUR_HEAD/CreateExcel?PUR_NO=${PUR_NO}`
      );
    },
    downLoadY() {
      var PUR_NO = this.pur_headForm.PUR_NO;
      downLoadFile(
        this.Global.baseUrl + `PUR_HEAD/CreateExcelY?PUR_NO=${PUR_NO}`
      );
    },
    downLoadAll() {
      var cid = this.companyId;
      var po = this.po == null || this.po == "" ? "all" : this.po;
      var customer =
        this.customer == null || this.customer == "" ? "all" : this.customer;
      var beginTime = this.getBegintime(this.date1);
      var finishTime = this.getEndtime(this.date2);
      var po_type =
        this.po_type == null || this.po_type == "" ? "all" : this.po_type;
      var selvalue = this.selvalue;
      var bill_type = this.bill_type;
      downLoadFile(
        this.Global.baseUrl +
          `PUR_HEAD/HeadAndDetailExcel?cid=${cid}&po=${po}&customer=${customer}&beginTime=${beginTime}&finishTime=${finishTime}&po_type=${po_type}&bill_type=${bill_type}`
      );
    },
    autoSearchDetail(PUR_NO) {
      var data = {
        PUR_NO: PUR_NO,
      };
      GetPoDetail(data).then((res) => {
        this.gridData = res.data;
        let loc = [];
        let tab1 = [];
        let tab2 = [];
        let tab3 = [];
        for (let i = 0; i < this.gridData.length; i++) {
          if (this.gridData[i].DATE_DELIVER == "9999/12/31 00:00:00") {
            this.gridData[i].DATE_DELIVER = "";
          }
          //将所有位置列出来
          if (loc.indexOf(this.gridData[i].CL_PLACE_ID) == -1) {
            loc.push(this.gridData[i].CL_PLACE_ID);

            let temObj1 = {
              cl_place_id: this.gridData[i].CL_PLACE_ID,
              cl_place: this.gridData[i].CL_PLACE,
              cl_item_no: this.gridData[i].CL_ITEM_NO,
              cl_width: this.gridData[i].CL_WIDTH,
              cl_high: this.gridData[i].CL_HIGH,
              cl_wbh_width: this.gridData[i].CL_WBH_WIDTH,
              cl_high_jia: this.gridData[i].CL_HIGH_JIA,
              cl_size_times: this.gridData[i].CL_SIZE_TIMES,
            };
            let date1 =
              "预约：" + this.datatransMethod(this.gridData[i].DATE_REQ);
            let date2 =
              "交货：" + this.datatransMethod(this.gridData[i].DATE_DELIVER);
            let temObj3 = {
              date_req: date1,
              date_deliver: date2,
              littleSum: 0,
            };
            let tempArr3 = [];
            tempArr3.push(temObj3);
            tab1.push(temObj1);
            tab3.push(tempArr3);
          }
        }
        this.items = []; //先请空items
        this.sumMoney = 0;
        for (let k = 0; k < tab1.length > 0; k++) {
          let tabArr2 = [];
          tab3[k].littleSum = 0.0;
          for (let i = 0; i < this.gridData.length; i++) {
            if (tab1[k].cl_place_id == this.gridData[i].CL_PLACE_ID) {
              let temObj2 = {
                cl_name: this.gridData[i].CL_NAME,
                item_no: this.gridData[i].ITEM_NO,
                mname: this.gridData[i].MNAME,
                grade: this.gridData[i].GRADE,
                qty_pur: this.gridData[i].QTY_PUR,
                unit1: this.gridData[i].UNIT1,
                price_taxin: this.gridData[i].PRICE_TAXIN,
                total_money: this.gridData[i].TOTAL_MONEY,
                product_note: this.gridData[i].PRODUCT_NOTE,
                notes: this.gridData[i].NOTE,
                lj_product_note: this.gridData[i].LJ_PRODUCT_NOTE,
              };
              tabArr2.push(temObj2);
              tab3[k][0].littleSum += this.gridData[i].TOTAL_MONEY;
              this.sumMoney += this.gridData[i].TOTAL_MONEY;
              this.sumMoneyCol[0].name8 = this.sumMoney;
            }
          }
          tab2.push(tabArr2);
          let sumObj = { id: k, tab1: tab1, tab2: tab2, tab3: tab3 };
          this.items.push(sumObj);
        }
        //对数据进行处理，便于排序
        // k ,j  i
        this.arr_index.splice(0, this.arr_index.length);
        this.arr_span.splice(0, this.arr_span.length);
        for (let k = 0; k < this.items.length; k++) {
          let arr = this.items[k].tab2[k];
          let let_intSpana = [];
          let let_index = [];
          var intSpan = 1;
          var intIndex = 0;

          for (let i = 0; i < arr.length; i++) {
            if (i == 0 && arr.length == 1) {
              let_index.push(intIndex);
              let_intSpana.push(intSpan);
            } else if (i > 0 && arr[i].cl_name === arr[i - 1].cl_name) {
              intSpan = intSpan + 1; //如果相同,该合并的rowSpan+1
              intIndex = i + 1 - intSpan; //row
            } else if (i > 0 && arr[i].cl_name != arr[i - 1].cl_name) {
              let_index.push(intIndex);
              let_intSpana.push(intSpan);

              intSpan = 1;
              intIndex = i;
            }
            if (i > 0 && i == arr.length - 1) {
              let_index.push(intIndex);
              let_intSpana.push(intSpan);
            }
          }
          this.arr_index.push(let_index);
          this.arr_span.push(let_intSpana);
        }

        this.pur_headForm.PUR_NO = PUR_NO;
        this.pur_headForm.LINKMAN = this.gridData[0].LINKMAN;
        this.pur_headForm.DATE_PUR = this.gridData[0].DATE_PUR;
        this.pur_headForm.DATE_DELIVER = this.gridData[0].DATE_DELIVER;
        this.pur_headForm.NOTES = this.gridData[0].NOTES;
        this.pur_headForm.SUPPLY_CHECK_NOTES = this.gridData[0].SUPPLY_CHECK_NOTES;
        this.pur_headForm.DEPT_NO = this.gridData[0].DEPT_NO;
        this.pur_headForm.DEPT_NO2 = this.gridData[0].DEPT_NO2;
        this.pur_headForm.SUPPLY_CODE = this.gridData[0].SUPPLY_CODE;
        this.pur_headForm.G_ADDRESS = this.gridData[0].G_ADDRESS;
        this.pur_headForm.G_LINK = this.gridData[0].G_LINK;
        this.pur_headForm.G_TYPE = this.gridData[0].G_TYPE;
        this.pur_headForm.G_PHONE = this.gridData[0].G_PHONE;
        this.pur_headForm.HANDSET = this.gridData[0].HANDSET;
        this.pur_headForm.ORDER_NO = this.gridData[0].ORDER_NO;
        this.pur_headForm.OA_NO = this.gridData[0].OA_NO;
        this.pur_headForm.ORDER_MAN = this.gridData[0].ORDER_MAN;
        this.pur_headForm.CUSTOMER_NAME = this.gridData[0].CUSTOMER_NAME;
        this.pur_headForm.PUR_MYFACT = this.gridData[0].PUR_MYFACT;
        this.pur_headForm.BUYER = this.gridData[0].BUYER;
        this.pur_headForm.PAY_TYPE = this.gridData[0].PAY_TYPE;
        this.pur_headForm.PAY_DATELIMIT = this.gridData[0].PAY_DATELIMIT;
        this.pur_headForm.C_BANK = this.gridData[0].C_BANK;
        this.pur_headForm.C_ADDRESS = this.gridData[0].C_ADDRESS;
        this.pur_headForm.C_POST = this.gridData[0].C_POST;
        this.pur_headForm.C_BANKNO = this.gridData[0].C_BANKNO;
        this.pur_headForm.C_TAX = this.gridData[0].C_TAX;
        this.pur_headForm.OWN_TEL = this.gridData[0].OWN_TEL;
        this.pur_headForm.LINKTEL = this.gridData[0].LINKTEL;
        this.pur_headForm.POST_ADDRESS = this.gridData[0].POST_ADDRESS;
        this.pur_headForm.STATUS = this.gridData[0].STATUS;
        this.pur_headForm.CONTRACT_NO = this.gridData[0].CONTRACT_NO;
        this.input = this.pur_headForm.SUPPLY_CHECK_NOTES;
        this.supply_check_notes = this.pur_headForm.SUPPLY_CHECK_NOTES;
        this.date_deliver = "";
        if (this.gridData[0].SUPPLY_CHECK_FLAG === "0") {
          if (
            this.gridData[0].ORDER_NO == "" ||
            this.gridData[0].ORDER_NO == null
          ) {
            this.checkY_Visible = true;
          } else if (this.gridData[0].ORDER_NO.substring(0, 1) == "X") {
            this.checkX_Visible = true;
          } else {
            this.checkY_Visible = true;
          }
        } else {
          if (
            this.gridData[0].ORDER_NO == "" ||
            this.gridData[0].ORDER_NO == null
          ) {
            this.checkedY_Visible = true;
          } else if (this.gridData[0].ORDER_NO.substring(0, 1) == "X") {
            this.checkedX_Visible = true;
          } else {
            this.checkedY_Visible = true;
          }
        }
      });
    },
  },
  filters: {
    pur_headStatus(value) {
      switch (value) {
        case "cancel":
          return "取消";
          break;
        case "efficient":
          return "生效";
          break;
        case "enforce":
          return "执行";
          break;
        case "fulfill":
          return "完成";
          break;
      }
    },
    numFilter(value) {
      var value = Math.round(parseFloat(value) * 100) / 100;
      var s = value.toString().split(".");
      if (s.length == 1) {
        value = value.toString() + ".00";
        return value;
      }
      if (s.length > 1) {
        if (s[1].length < 2) {
          value = value.toString() + "0";
        }
        return value;
      }
    },
    datatrans(value) {
      //时间戳转化大法
      if (value == null || value == "") {
        return "";
      }
      let date = new Date(value);
      let y = date.getFullYear();
      if (y > 5000) {
        return "";
      }
      let MM = date.getMonth() + 1;
      MM = MM < 10 ? "0" + MM : MM;
      let d = date.getDate();
      d = d < 10 ? "0" + d : d;
      let h = date.getHours();
      h = h < 10 ? "0" + h : h;
      let m = date.getMinutes();
      m = m < 10 ? "0" + m : m;
      let s = date.getSeconds();
      s = s < 10 ? "0" + s : s;
      return y + "-" + MM + "-" + d + " "; /* + h + ':' + m + ':' + s; */
    },
  },
  created() {
    this.po_type = "all";
    this.autoSearch();
  },
};
</script>

<style scoped>
.customerInfo {
  border: 1.5px solid #0000ff;
}
.th-font18 {
  font-size: 18px;
  font-weight: bold;
}
.th-font18color {
  font-size: 18px;
  font-weight: bold;
  color: #0000ff;
}
.tb_font14_bold {
  font-size: 14px;
  font-weight: bold;
}
.tb_font12_bold {
  font-size: 12px;
  font-weight: bold;
}
.tb_font13 {
  font-size: 13px;
}
.th-font16 {
  font-size: 16px;
  font-weight: bold;
}
.th-font14 {
  font-size: 12px;
}
.button_1 {
  width: 110px;
  height: 30px;
  background: #8bc34a;

  color: rgb(255, 255, 255);
  text-align: center;
}
.button_2 {
  width: 60px;
  height: 30px;
  background: #8bc34a;
  margin-left: 10px;
  color: rgb(255, 255, 255);
  text-align: center;
}
.button_3 {
  width: 80px;
  height: 30px;
  background: #e6a23c;
  margin-left: 10px;
  color: rgb(255, 255, 255);
  text-align: center;
}
.button_4 {
  width: 120px;
  background: #e6a23c;
  margin-left: 20px;
  color: rgb(255, 255, 255);
  text-align: center;
}
.btn-style {
  font: 12px Arial;
  height: 24px;
  width: 80px;
  background: #409eff;
  color: rgb(255, 255, 255);
  border: 3px solid #409eff;
  border-radius: 5px;
  cursor: pointer;
}
.messageInput {
  margin: 3px;
  border: 1px solid #c3c3c3;
  margin-right: 3px;
  /* padding: 3px 6px 3px 6px; */
  min-width: 26px;
  border-radius: 4px;
  color: rgb(0, 0, 255);
  display: inline-block;
}
.button_clolur {
  background: #8bc34a;
  color: rgb(255, 255, 255);
}
.button_yellowclolur {
  background: #8bc34a;
  color: rgb(255, 255, 255);
}
.messageBox1 {
  padding: 3px 0;
  font-size: 13px;
}
.messageBox {
  padding: 3px 0;
  font-size: 13px;
}
.data_1 {
  font-size: 1.5em;
}
td {
  text-align: center;
}
.line_noDiv {
  width: 20px;
  height: 20px;
  border: 1px solid black;
  border-radius: 20px;
  text-align: center;
  position: absolute;
  top: 0px;
  left: 0;
}
.line_noSpan {
  width: 20px;
  height: 20px;
  text-align: center;
  margin: -1px 0 0 -1px;
  display: block;
}
</style>
<style>
.tb_font13 .el-input__inner {
  width: 115px;
  height: 30px;
  font-size: 13px;
  padding-right: 0px;
  line-height: 30px;
}

.tb_font13 .el-input__icon {
  line-height: 30px;
}
.lanJuport1 .el-input__inner {
  height: 30px;
}
.lanJuport1 .el-input__icon {
  line-height: 30px;
}

.lanJuport1 .el-table td,
.lanJuport1 .el-table th {
  padding: 3px 0 !important;
}
.fixedDiv {
  position: fixed;
  border: 1px;
  border-color: #000;
  z-index: 1;
  top: 180px;
  margin-left: 900px;
  z-index: 9999;
}
</style>