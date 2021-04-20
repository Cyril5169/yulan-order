<template>
  <el-card shadow="never">
    <div class="lanJuport1">
      <el-tabs v-model="activeName" @tab-click="handleClick">
        <!-- 待确认页签 -->
        <el-tab-pane label="待确认" name="first">
          <div style="margin-bottom:10px;">
            <el-input @keyup.enter.native="SelectByPo()" placeholder=" 采购单号:（模糊）" v-model="purNo" style="width:160px;" clearable>
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
          <el-table @selection-change="handleSelectionChange" border :data="pur_headData" size="small" highlight-current-row>
            <el-table-column type="selection" align="center" width="40">
            </el-table-column>
            <el-table-column type="index" label=" " align="center" :index="indexMethod" width="40">
            </el-table-column>
            <el-table-column prop="PUR_NO" align="center" width="100" label="单号"></el-table-column>
            <el-table-column prop="CUSTOMER_NAME" width="200" label="客户名称" header-align="center">
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
            <el-table-column prop="NOTES" header-align="center" label="备注">
            </el-table-column>
            <el-table-column prop="LJ_SUGGESTION" label="兰居备注" width="80"></el-table-column>
            <el-table-column label="操作" width="120" align="center">
              <template slot-scope="scope">
                <button @click="autoSearchDetail(scope.row)" class="btn-style">前往确认</button>
              </template>
            </el-table-column>
          </el-table>
        </el-tab-pane>
        <!-- 已确认页签 -->
        <el-tab-pane label="采购已确认" name="second">
          <div style="margin-bottom:10px;">
            <el-input @keyup.enter.native="SelectByCustomer()" placeholder=" 客户(输入后回车)" v-model="customer" style="width:160px;"
              clearable>
            </el-input>
            <el-input @keyup.enter.native="SelectByPo()" placeholder=" 采购单号/订单号" v-model="purNo" style="width:160px;" clearable>
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
          <el-table border @selection-change="handleSelectionChange" :data="pur_headData" size="small" highlight-current-row>
            <el-table-column label=" " type="index" :index="indexMethod" align="center" width="40">
            </el-table-column>
            <el-table-column prop="PUR_NO" width="100" label="单号" align="center"></el-table-column>
            <el-table-column prop="CUSTOMER_NAME" width="200" header-align="center" label="客户名称">
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
            <el-table-column fomate="yyyy-MM-dd" width="100" label="建立日期" align="center">
              <template slot-scope="scope">
                <span>{{ scope.row.DATE_PUR | datatrans }}</span>
              </template>
            </el-table-column>
            <el-table-column prop="NOTES" header-align="center" label="备注">
            </el-table-column>
            <el-table-column prop="LJ_SUGGESTION" header-align="center" label="兰居备注" width="80"></el-table-column>
            <el-table-column label="操作" width="100" align="center">
              <template slot-scope="scope">
                <button @click="autoSearchDetail(scope.row)" class="btn-style">查看详情</button>
              </template>
            </el-table-column>
            <el-table-column width="100" label="同步标记" prop="IMPORT_FLAG" align="center">
              <template slot-scope="scope">
                <span v-if="scope.row.ORDER_NO.substring(0, 1) != 'X' && scope.row.ORDER_NO.substring(0, 1) != 'N'"></span>
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
        <!-- 已取消页签 -->
        <el-tab-pane label="已取消" name="third">
          <div style="margin-bottom:10px;">
            <el-input @keyup.enter.native="SelectByPo()" placeholder=" 采购单号:（模糊）" v-model="purNo" style="width:160px;" clearable>
            </el-input>
            <el-date-picker v-model="date1" placeholder="开始时间" align="right" type="date" format="yyyy-MM-dd"
              value-format="yyyy-MM-dd" style="width:140px;">
            </el-date-picker>
            <span class="demonstration">至</span>
            <el-date-picker v-model="date2" placeholder="结束时间" align="right" type="date" format="yyyy-MM-dd"
              value-format="yyyy-MM-dd" style="width:140px;"></el-date-picker>
            <el-button @click="SelectClick()" size="small" style="margin-left:8px" class="button_2">搜索</el-button>
          </div>
          <el-table border :data="pur_headData" size="small" highlight-current-row>
            <el-table-column label=" " type="index" :index="indexMethod" align="center" width="40">
            </el-table-column>
            <el-table-column prop="PUR_NO" width="100" align="center" label="单号">
            </el-table-column>
            <el-table-column prop="CUSTOMER_NAME" width="200" header-align="center" label="客户名称">
            </el-table-column>
            <el-table-column label="状态" width="60" align="center">
              <template slot-scope="scope"><span>{{ scope.row.STATUS | pur_headStatus }}</span></template>
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
            <el-table-column prop="NOTES" label="备注" header-align="center">
            </el-table-column>
            <el-table-column prop="LJ_SUGGESTION" label="兰居备注" width="80"></el-table-column>
            <el-table-column label="操作" width="120" align="center">
              <template slot-scope="scope">
                <button @click="autoSearchDetail(scope.row)" class="btn-style">查看详情</button>
              </template>
            </el-table-column>
          </el-table>
        </el-tab-pane>
        <!-- 退货已确认页签 -->
        <el-tab-pane label="退货已确认" name="forth">
          <div style="margin-bottom:10px;">
            <el-input @keyup.enter.native="SelectByCustomer()" placeholder=" 客户(输入后回车)" v-model="customer" style="width:160px;"
              clearable>
            </el-input>
            <el-input @keyup.enter.native="SelectByPo()" placeholder=" 采购单号:（模糊）" v-model="purNo" style="width:160px;" clearable>
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
          <el-table border @selection-change="handleSelectionChange" :data="pur_headData" size="small" highlight-current-row>
            <el-table-column label=" " type="index" :index="indexMethod" align="center" width="40">
            </el-table-column>
            <el-table-column prop="PUR_NO" width="100" label="单号" align="center"></el-table-column>
            <el-table-column prop="CUSTOMER_NAME" width="200" header-align="center" label="客户名称">
            </el-table-column>
            <el-table-column label="状态" width="60" align="center">
              <template slot-scope="scope"><span>{{ scope.row.STATUS | pur_headStatus }}</span></template>
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
            <el-table-column prop="NOTES" header-align="center" label="备注">
            </el-table-column>
            <el-table-column prop="LJ_SUGGESTION" label="兰居备注" width="80"></el-table-column>
            <el-table-column label="操作" width="120" align="center">
              <template slot-scope="scope">
                <button @click="autoSearchDetail(scope.row)" class="btn-style">查看详情</button>
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
        <!-- 底部分页 -->
        <div style="margin:5px 25%;">
          <el-pagination @size-change="handleSizeChange" @current-change="handleCurrentChange" :current-page.sync="currentPage"
            :page-sizes="[15, 30, 50, 100]" :page-size="limit" layout="total, sizes, prev, pager, next, jumper" :total="count">
          </el-pagination>
        </div>
      </el-tabs>
    </div>

    <!-- 待确认采购单界面兰 -->
    <el-dialog :show-close="true" :visible.sync="checkVisible" :close-on-click-modal="false" width="1170px" top="8vh">
      <div class="th-font18" style="text-align:center;margin-bottom:10px;">
        <span>广东玉兰集团股份有限公司采购单（<span class="th-font18color">{{ pur_headForm.PUR_NO }}</span>）</span>
      </div>
      <div style="margin-bottom:10px">
        <span>收货人：{{ pur_headForm.LINKMAN }}&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;日期：
          {{pur_headForm.DATE_PUR | datatrans }}</span>
      </div>
      <div style="margin-bottom:10px">
        <span>备注信息：{{ pur_headForm.NOTES }}</span>
      </div>
      <hr />
      <!-- 软装 -->
      <div style="width:100%" v-if="orderNoPreFix != 'X' && orderNoPreFix != 'N'">
        <el-table :data="gridData" border class="tb_font13" show-summary :summary-method="getYSummaries" key="checkY">
          <el-table-column type="index" label=" " align="center" :index="indexMethod" width="40">
          </el-table-column>
          <el-table-column prop="ITEM_NO" label="物料号" align="center" width="120"></el-table-column>
          <el-table-column prop="MGUIGE" label="物料型号" align="center" width="120"></el-table-column>
          <el-table-column prop="MNAME" label="名称" header-align="center" width="80"></el-table-column>
          <el-table-column prop="GRADE" label="规格" header-align="center" width="70"></el-table-column>
          <el-table-column prop="QTY_PUR" label="数量" header-align="center" align="right" width="60">
          </el-table-column>
          <el-table-column label="含税单价" header-align="center" align="right" width="80">
            <template slot-scope="scope">
              <span>{{ scope.row.PRICE_TAXIN | numFilter }}</span>
            </template>
          </el-table-column>
          <el-table-column prop="UNIT1" label="单位" align="center" width="60"></el-table-column>
          <el-table-column prop="TOTAL_MONEY" label="金额" header-align="center" align="right" width="90">
            <template slot-scope="scope">
              <span>{{ scope.row.TOTAL_MONEY | numFilter }}</span>
            </template>
          </el-table-column>
          <el-table-column prop="NOTE" label="备注" header-align="center"></el-table-column>
          <el-table-column prop="DATE_REQ" label="约定日期" align="center" width="88">
            <template slot-scope="scope"> <span>{{ scope.row.DATE_REQ | datatrans }}</span> </template>
          </el-table-column>
          <el-table-column label="送货日期" header-align="center" width="130">
            <template slot-scope="scope">
              <el-date-picker v-model="scope.row.DATE_DELIVER" align="right" type="date" format="yyyy-MM-dd"
                value-format="yyyy-MM-dd" placeholder="选择日期">
              </el-date-picker>
            </template>
          </el-table-column>
          <el-table-column label="说明" header-align="center" width="130">
            <template slot-scope="scope">
              <el-input style="width:120px;" v-model="scope.row.SUPPLY_NOTES" clearable></el-input>
            </template>
          </el-table-column>
        </el-table>
        <hr />
        <div style="margin-top:10px" class="th-font16">
          <div>
            <span>送货日期:</span>
            <el-date-picker v-model="date_deliver" type="date" format="yyyy-MM-dd" value-format="yyyy-MM-dd" placeholder="选择时间"
              style="width:18%"></el-date-picker>
            <el-button style="width:16%" class="button_clolur" @click="Unitdeliver">统一设置送货期</el-button>
            <el-button style="width:16%;margin-top:10px" class="button_clolur" @click="AllAccordPromise">全部设为约定日期
            </el-button>
          </div>
          <div style="margin-top:20px">
            <span>说&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;明:</span>
            <el-input v-model="supply_check_notes" placeholder="说明:" style="width:42%;height:10px" clearable>
            </el-input>
            <el-button @click="SaveNotes()" style="width:10%;" class="button_clolur">保存说明
            </el-button>
          </div>
        </div>
        <div style="text-align:center;margin-top:10px;">
          <el-button @click="SubmitVue" style="width:10%;" type="warning" size="small">确认</el-button>
          <el-button @click="returnMain" style="width:10%;" type="primary" size="small">返回</el-button>
        </div>
      </div>
      <!-- 窗帘 -->
      <div style="width:100%" v-if="orderNoPreFix == 'X'">
        <el-table :data="colName" :show-header="false" border class="tb_font14_bold" key="checkX">
          <af-table-column prop="name1" label="位置" align="center" width="120"></af-table-column>
          <af-table-column prop="name2" label="名称" align="center" width="80"></af-table-column>
          <af-table-column prop="name3" label="编码" align="center" width="120"></af-table-column>
          <af-table-column prop="name4" label="名称" align="center" width="150"></af-table-column>
          <af-table-column prop="name5" label="规格:米/对" width="60"></af-table-column>
          <el-table-column prop="name6" label="用量" align="center" width="80"></el-table-column>
          <el-table-column prop="name7" label="含税单价" align="center" width="100"></el-table-column>
          <el-table-column prop="name8" label="金额" align="center" width="80"></el-table-column>
          <el-table-column prop="name9" label="制造说明" align="center" width="80"></el-table-column>
          <el-table-column prop="name10" label="备注" align="center" width="130"></el-table-column>
          <el-table-column prop="name11" label="生产备注" align="center"></el-table-column>
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
                  :span-method="function(col){ return arraySpanMethod(col,index)}" class="tb_font13" border>
                  <el-table-column label="inner名称" align="center" width="80"> <template
                      slot-scope="scope">{{getTypeName(scope.row.cl_name)}}</template> </el-table-column>
                  <el-table-column prop="item_no" width="120" label="inner编码"></el-table-column>
                  <el-table-column prop="mname" label="inner名称" header-align="center" width="150"></el-table-column>
                  <el-table-column prop="grade" label="inner规格:米/对" header-align="center" width="60">
                  </el-table-column>
                  <el-table-column label="inner用量" align="right" width="80">
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
            <!-- 小计 -->
            <el-table class="tb_font12_bold" style="width:100%;" :show-header="false" :data="item.tab3[index]">
              <el-table-column prop="date_req" label="预约" header-align="center" width="120"></el-table-column>
              <el-table-column prop="date_deliver" label="交货" header-align="center" width="200"></el-table-column>
              <el-table-column label="名称" header-align="center" width="150"></el-table-column>
              <el-table-column label="规格:米/对" header-align="center" align="center" width="60"> </el-table-column>
              <el-table-column label="用量" header-align="center" align="center" width="80"></el-table-column>
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
        <el-table :data="sumMoneyCol" :show-header="false" class="tb_font14_bold" key="checkXSum">
          <af-table-column prop="name1" label="位置" width="120"></af-table-column>
          <af-table-column prop="name2" label="名称" align="center" width="80"></af-table-column>
          <af-table-column prop="name3" label="编码" width="120"></af-table-column>
          <af-table-column prop="name4" label="名称" width="150"></af-table-column>
          <af-table-column prop="name5" label="规格:米/对" width="60"></af-table-column>
          <el-table-column prop="name6" label="用量" width="80"></el-table-column>
          <el-table-column prop="name7" label="含税单价" header-align="center" align="right" width="100">
          </el-table-column>
          <el-table-column label="金额" align="right" width="80">
            <template slot-scope="scope">
              {{scope.row.name8|numFilter}}
            </template>
          </el-table-column>
          <el-table-column prop="name9" label="制造说明" width="80"></el-table-column>
          <el-table-column prop="name10" label="备注" width="130"></el-table-column>
          <el-table-column prop="name11" label="生产备注"></el-table-column>
        </el-table>
        <hr />
        <div style="margin-top:10px" class="th-font16">
          <div>
            <span>送货日期:</span>
            <el-date-picker v-model="date_deliver" type="date" format="yyyy-MM-dd" value-format="yyyy-MM-dd" placeholder="选择时间"
              style="width:18%"></el-date-picker>
          </div>
          <div style="margin-top:20px">
            <span>说&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;明:</span>
            <el-input v-model="supply_check_notes" placeholder="说明:" style="width:42%;height:10px" clearable>
            </el-input>
            <el-button @click="SaveNotes()" style="width:10%;" class="button_clolur">保存说明
            </el-button>
          </div>
        </div>
        <div style="text-align:center;margin-top:10px;">
          <el-button @click="SubmitVue" style="width:10%;" type="warning" size="small">确认
          </el-button>
          <el-button @click="returnMain" style="width:10%;" type="primary" size="small">返回
          </el-button>
        </div>
      </div>
      <!-- 新窗帘 -->
      <div style="width:100%" v-if="orderNoPreFix == 'N'">
        <el-table border :data="gridData" :row-class-name="headTableRowClassName" :expand-row-keys="expands" :row-key="getRowKeys"
          key="checkN" class="checkN">
          <el-table-column width="1" type="expand">
            <template slot-scope="scopeHead">
              <div class="curtain-list">
                <el-table :data="scopeHead.row.curtains" ref="curtainTable" class="curtain-table" border
                  :row-class-name="tableRowClassName" show-summary :summary-method="getNSummaries">
                  <el-table-column label="部件" width="80" header-align="center" prop="NC_PART_TYPECODE">
                    <template slot-scope="scope">
                      <!-- 树缩进 -->
                      <span v-if="scope.row.curtain_level > 0">
                        <span :style="{'padding-left': scope.row.curtain_level * 16 + 'px'}"></span>
                      </span>
                      <span>{{transPartTypeCode(scope.row.NC_PART_TYPECODE)}}</span>
                    </template>
                  </el-table-column>
                  <el-table-column label="编码" width="140" header-align="center" prop="ITEM_NO">
                  </el-table-column>
                  <el-table-column label="名称" width="80" header-align="center" prop="CURTAIN_ITEM_NAME">
                  </el-table-column>
                  <el-table-column label="制造说明" width="250" header-align="center">
                    <template slot-scope="scope">
                      <!-- N个配置项逐个检测 -->
                      <!-- 宽，高 -->
                      <div class="manufacturing-ct" v-if="scope.row.WIDTH_ENABLE > 0 || scope.row.HEIGHT_ENABLE > 0">
                        <template v-if="scope.row.WIDTH_ENABLE == 1 || scope.row.WIDTH_ENABLE == 2">
                          <span>【宽】: {{ scope.row.WIDTH }}m</span>
                        </template>
                        <template v-if="scope.row.HEIGHT_ENABLE == 1 || scope.row.HEIGHT_ENABLE == 2">
                          <span>【高】: {{ scope.row.HEIGHT }}m</span>
                        </template>
                      </div>
                      <!-- 左右转角 -->
                      <div class="manufacturing-ct" v-if="scope.row.LEFT_ENABLE > 0 || scope.row.RIGHT_ENABLE > 0">
                        <template v-if="scope.row.LEFT_ENABLE == 1 || scope.row.LEFT_ENABLE == 2">
                          <span>【左转角】: {{ scope.row.LEFT_FILLET }}m</span>
                        </template>
                        <template v-if="scope.row.RIGHT_ENABLE == 1 || scope.row.RIGHT_ENABLE == 2">
                          <span>【右转角】: {{ scope.row.RIGHT_FILLET }}m</span>
                        </template>
                      </div>
                      <!-- 么术贴 -->
                      <div class="manufacturing-ct" v-if="scope.row.TIE_ENABLE > 0">
                        <template v-if="scope.row.TIE_ENABLE == 1 || scope.row.TIE_ENABLE == 2">
                          <span>【么术贴】: {{ scope.row.MESUTIE | meshutie_filter}}</span>
                        </template>
                      </div>
                      <!-- 打开方式 -->
                      <div class="manufacturing-ct" v-if="scope.row.KAIKOU_ENABLE > 0">
                        <template v-if="scope.row.KAIKOU_ENABLE == 1 || scope.row.KAIKOU_ENABLE == 2">
                          <span>【打开方式】: {{ scope.row.KAIKOU | kaikou_filter }}</span>
                        </template>
                      </div>
                      <!-- 工艺方式 -->
                      <div class="manufacturing-ct" v-if="scope.row.OPERATION_ENABLE > 0">
                        <template v-if="scope.row.OPERATION_ENABLE == 1 || scope.row.OPERATION_ENABLE == 2">
                          <span>【工艺方式】: {{ scope.row.OPERATION | operation_filter }}</span>
                        </template>
                      </div>
                      <!-- 包边方式 -->
                      <div class="manufacturing-ct" v-if="scope.row.BIAN_ENABLE > 0">
                        <template v-if="scope.row.BIAN_ENABLE == 1 || scope.row.BIAN_ENABLE == 2">
                          <span>【包边方式】: {{ scope.row.BIAN | bian_filter }}</span>
                        </template>
                      </div>
                      <!-- 说明 -->
                      <div class="manufacturing-ct"
                        v-if="scope.row.NCM_NOTE || scope.row.JOINT || scope.row.WRINKLE || scope.row.MAKETYPE ">
                        <span>【说明】: <template v-if="scope.row.MAKETYPE">{{scope.row.MAKETYPE | makeType_filter}}<template
                              v-if="scope.row.JOINT || scope.row.WRINKLE || scope.row.NCM_NOTE">、</template></template>
                          <template v-if="scope.row.JOINT">{{scope.row.JOINT | joint_filter}}<template
                              v-if="scope.row.WRINKLE || scope.row.NCM_NOTE">、</template></template>
                          <template v-if="scope.row.WRINKLE">{{scope.row.WRINKLE }}褶<template
                              v-if="scope.row.NCM_NOTE">、</template></template>
                          <template v-if="scope.row.NCM_NOTE">{{scope.row.NCM_NOTE }}</template></span>
                      </div>
                    </template>
                  </el-table-column>
                  <el-table-column label="褶数" width="50" align="center" prop="ZE_QTY">
                  </el-table-column>
                  <el-table-column label="用量" width="100" align="center" prop="DOSAGE">
                    <template slot-scope="scope">
                      <span v-if="scope.row.NC_PART_TYPECODE != 'LBT'">
                        {{scope.row.DOSAGE}}{{scope.row.UNIT_NAME}}
                      </span>
                      <span v-else>-</span>
                    </template>
                  </el-table-column>
                  <el-table-column label="含税单价" width="80" align="center" prop="PRICE_TAXIN">
                    <template slot-scope="scope">
                      <!-- 只有部件算钱 -->
                      <span v-if="scope.row.curtain_level == 0">{{scope.row.PRICE_TAXIN | numFilter}}</span>
                      <span v-else>-</span>
                    </template>
                  </el-table-column>
                  <el-table-column label="金额" width="80" align="center" prop="TOTAL_MONEY">
                    <template slot-scope="scope">
                      <!-- 只有部件算钱 -->
                      <span v-if="scope.row.curtain_level == 0">{{ scope.row.TOTAL_MONEY | numFilter }}</span>
                      <span v-else>-</span>
                    </template>
                  </el-table-column>
                  <el-table-column label="说明" width="100" header-align="center" prop="ILLUSTRATE">
                    <template slot-scope="scope">
                      <span style="color:red;font-size:12px;"> {{ scope.row.ILLUSTRATE }}</span>
                    </template>
                  </el-table-column>
                  <el-table-column label="客户备注" align="center" prop="NOTE">
                  </el-table-column>
                  <el-table-column label="兰居意见" header-align="center" prop="SUGGESTION">
                  </el-table-column>
                </el-table>
              </div>
            </template>
          </el-table-column>
          <el-table-column align="center" prop="LINE_NO" label="序号" width="40"></el-table-column>
          <el-table-column align="center" prop="ITEM_NO" label="款号" width="100"></el-table-column>
          <el-table-column align="center" prop="BRAND_NAME" label="品牌" width="90"></el-table-column>
          <el-table-column align="center" prop="TYPE_NAME" label="类型" width="90"></el-table-column>
          <el-table-column prop="PRODUCTION_VERSION" align="center" label="所属版本" width="90"></el-table-column>
          <el-table-column label="销售状态" align="center" width="90">
            <template slot-scope="scope">
              <span>{{ scope.row.SALE_ID | transSaleId }}</span>
            </template>
          </el-table-column>
          <el-table-column align="center" prop="CURTAIN_WIDTH" label="成品宽" width="80"></el-table-column>
          <el-table-column align="center" prop="CURTAIN_HEIGHT" label="成品高" width="80"></el-table-column>
          <el-table-column align="center" prop="ANCAO_HEIGHT" label="暗槽高" width="80"></el-table-column>
          <el-table-column align="center" prop="CURTAIN_ROOM_NAME" label="位置" width="100"></el-table-column>
          <el-table-column align="center" prop="QTY_REQUIRED" label="套数" width="70"></el-table-column>
          <el-table-column prop="PROMOTION" align="center" label="活动" show-overflow-tooltip></el-table-column>
          <el-table-column align="center" prop="NOTES" label="备注"></el-table-column>
        </el-table>
        <div>
          <span style="font-size:16px;margin-left: 725px;">总金额：{{newCurtainTotalMoney}}</span></span>
        </div>
        <hr />
        <div style="margin-top:10px" class="th-font16">
          <div>
            <span>送货日期:</span>
            <el-date-picker v-model="date_deliver" type="date" format="yyyy-MM-dd" value-format="yyyy-MM-dd" placeholder="选择时间"
              style="width:18%"></el-date-picker>
          </div>
          <div style="margin-top:20px">
            <span>说&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;明:</span>
            <el-input v-model="supply_check_notes" placeholder="说明:" style="width:42%;height:10px" clearable>
            </el-input>
            <el-button @click="SaveNotes()" style="width:10%;" class="button_clolur">保存说明
            </el-button>
          </div>
        </div>
        <div style="text-align:center;margin-top:10px;">
          <el-button @click="SubmitVue" style="width:10%;" type="warning" size="small">确认
          </el-button>
          <el-button @click="returnMain" style="width:10%;" type="primary" size="small">返回
          </el-button>
        </div>
      </div>
    </el-dialog>

    <!-- 已确认采购单详情界面 -->
    <el-dialog :show-close="true" :visible.sync="checkedVisible" :close-on-click-modal="false" width="1170px" top="8vh">
      <div class="fixedDiv">
        <div style="margin:20px">
          <el-button @click="returnMain" type="primary" size="small">返&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;回
          </el-button>
        </div>
        <div style="margin:20px">
          <el-button @click="downLoadY()" type="primary" size="small">导出Excel</el-button>
        </div>
        <div style="margin:20px">
          <el-button @click="printRefund('checkedYPrint')" icon="el-icon-printer" type="primary" size="small">
            打&nbsp;&nbsp;&nbsp;印
          </el-button>
        </div>
      </div>
      <div id="checkedYPrint">
        <table style="width:100%;">
          <tr>
            <td colspan="2" style="font-size:22px;font-weight:bold;" align="center">
              <span>广东玉兰集团股份有限公司采购单（<span class="th-font18color">{{ pur_headForm.PUR_NO }}</span>）</span>
            </td>
          </tr>
          <tr>
            <td style="border-bottom:solid 3px gray;text-align:left;">
              <span style="font-weight:bold;">订单状态：{{ pur_headForm.STATUS | pur_headStatus }}</span>
            </td>
            <td style="border-bottom:solid 3px gray;text-align:right">
              <span style="font-weight:bold;">打印日期：{{ now.getFullYear() + "-" + Month + "-" + now.getDate() }}</span>
            </td>
          </tr>
          <tr>
            <!-- 左边列表 -->
            <td style="border-right:solid 1px gray;border-bottom:solid 3px gray;" width="50%" valign="top">
              <table style="width:100%;">
                <tr>
                  <td style="text-align:right;" width="100">流水号：</td>
                  <td style="text-align:left;">{{ pur_headForm.PUR_NO }}</td>
                </tr>
                <tr>
                  <td style="text-align:right;">采购员：</td>
                  <td style="text-align:left;">{{ pur_headForm.BUYER }}</td>
                </tr>
                <tr>
                  <td style="text-align:right;">建立日期：</td>
                  <td style="text-align:left;">{{ pur_headForm.DATE_PUR | datatrans}}</td>
                </tr>
                <tr>
                  <td style="text-align:right;">采购商：</td>
                  <td style="text-align:left;">{{ pur_headForm.PUR_MYFACT }}</td>
                </tr>
                <tr>
                  <td style="text-align:right;">采购商地址：</td>
                  <td style="text-align:left;">{{ pur_headForm.C_ADDRESS }}</td>
                </tr>
                <tr>
                  <td style="text-align:right;">开户银行：</td>
                  <td style="text-align:left;">{{ pur_headForm.C_BANK }}</td>
                </tr>
                <tr>
                  <td style="text-align:right;">邮政编码：</td>
                  <td style="text-align:left;">{{ pur_headForm.C_POST }}</td>
                </tr>
                <tr>
                  <td style="text-align:right;">银行账号：</td>
                  <td style="text-align:left;">{{ pur_headForm.C_BANKNO }}</td>
                </tr>
                <tr>
                  <td style="text-align:right;">税务登记号：</td>
                  <td style="text-align:left;">{{ pur_headForm.C_TAX }}</td>
                </tr>
                <tr>
                  <td style="text-align:right;">联系电话：</td>
                  <td style="text-align:left;">{{ pur_headForm.OWN_TEL }}</td>
                </tr>
                <tr>
                  <td style="text-align:right;">付款方式：</td>
                  <td style="text-align:left;">{{ pur_headForm.PAY_TYPE }}</td>
                </tr>
                <tr>
                  <td style="text-align:right;">付款期限：</td>
                  <td style="text-align:left;">{{ pur_headForm.PAY_DATELIMIT | datatrans}}</td>
                </tr>
                <tr>
                  <td style="text-align:right;">备注：</td>
                  <td style="text-align:left;">{{ pur_headForm.NOTES }}</td>
                </tr>
              </table>
            </td>
            <!-- 右边列表 -->
            <td style="border-left:solid 1px gray;border-bottom:solid 3px gray;" width="50%">
              <table style="width:100%;">
                <tr>
                  <td style="text-align:right;" width="100">采购部门：</td>
                  <td colsan="3" style="text-align:left;">{{ pur_headForm.DEPT_NO }}</td>
                </tr>
                <tr>
                  <td style="text-align:right;">合同号：</td>
                  <td colsan="3" style="text-align:left;">{{ pur_headForm.CONTRACT_NO }}</td>
                </tr>
                <tr>
                  <td style="text-align:right;">供应商：</td>
                  <td colsan="3" style="text-align:left;">{{ pur_headForm.SUPPLY_CODE }}</td>
                </tr>
                <tr>
                  <td style="text-align:right;">供应商地址：</td>
                  <td colsan="3" style="text-align:left;">{{ pur_headForm.G_ADDRESS }}</td>
                </tr>
                <tr>
                  <td style="text-align:right;">联系人：</td>
                  <td colsan="3" style="text-align:left;">{{ pur_headForm.G_LINK }}</td>
                </tr>
                <tr>
                  <td style="text-align:right;">传真号码：</td>
                  <td colsan="3" style="text-align:left;">{{ pur_headForm.G_TYPE }}</td>
                </tr>
                <tr>
                  <td style="text-align:right;">电话：</td>
                  <td colsan="3" style="text-align:left;">{{ pur_headForm.G_PHONE }}</td>
                </tr>
                <tr>
                  <td style="text-align:right;">手机：</td>
                  <td colsan="3" style="text-align:left;">{{ pur_headForm.HANDSET }}</td>
                </tr>
                <tr>
                  <td style="text-align:right;">B2B订单号：</td>
                  <td colsan="3" style="text-align:left;">{{ pur_headForm.ORDER_NO }}</td>
                </tr>
                <tr>
                  <td style="text-align:right;">ERP订单号：</td>
                  <td colsan="3" style="text-align:left;">{{ pur_headForm.OA_NO }}</td>
                </tr>
                <tr>
                  <td style="text-align:right;">接单人：</td>
                  <td colsan="3" style="text-align:left;">{{ pur_headForm.ORDER_MAN }}</td>
                </tr>
              </table>
              <!-- 客户信息列表 -->
              <table class="customerInfo">
                <tr>
                  <td style="text-align:right;" width="100">客户名称：</td>
                  <td colsan="3" style="text-align:left;"> {{ pur_headForm.CUSTOMER_NAME }}</td>
                </tr>
                <tr>
                  <td style="text-align:right;">联系人：</td>
                  <td colsan="3" style="text-align:left;"> {{ pur_headForm.LINKMAN }}
                  </td>
                </tr>
                <tr>
                  <td style="text-align:right;">联系电话：</td>
                  <td colsan="4" style="text-align:left;"> {{ pur_headForm.LINKTEL }}</td>
                </tr>
                <tr>
                  <td style="text-align:right;">发货地址：</td>
                  <td colsan="4" style="text-align:left;"> {{ pur_headForm.POST_ADDRESS }} </td>
                </tr>
              </table>
            </td>
          </tr>
        </table>
        <!-- 下面列表 -->
        <!-- 软装 -->
        <div v-if="orderNoPreFix != 'X' && orderNoPreFix != 'N'">
          <el-table :data="gridData" border show-summary :summary-method="getYSummaries" key="checkedY">
            <el-table-column type="index" label=" " align="center" :index="indexMethod" width="40">
            </el-table-column>
            <el-table-column prop="ITEM_NO" label="物料号" align="center" width="120"></el-table-column>
            <el-table-column prop="MGUIGE" label="物料型号" align="center" width="120"></el-table-column>
            <el-table-column prop="MNAME" label="名称" header-align="center" width="80"></el-table-column>
            <el-table-column prop="GRADE" label="规格" header-align="center" width="80"></el-table-column>
            <el-table-column prop="QTY_PUR" label="数量" header-align="center" align="right" width="60">
            </el-table-column>
            <el-table-column label="含税单价" header-align="center" align="right" width="80">
              <template slot-scope="scope">
                <span>{{ scope.row.PRICE_TAXIN | numFilter }}</span>
              </template>
            </el-table-column>
            <el-table-column prop="UNIT1" label="单位" align="center" width="70"></el-table-column>
            <el-table-column prop="TOTAL_MONEY" label="金额" header-align="center" align="right" width="90">
              <template slot-scope="scope">
                <span>{{ scope.row.TOTAL_MONEY | numFilter }}</span>
              </template>
            </el-table-column>
            <el-table-column prop="NOTE" label="备注" header-align="center"></el-table-column>
            <el-table-column prop="DATE_REQ" label="约定日期" align="center" width="90">
              <template slot-scope="scope"> <span>{{ scope.row.DATE_REQ | datatrans }}</span> </template>
            </el-table-column>
            <el-table-column prop="DATE_DELIVER" label="送货日期" align="center" width="100">
              <template slot-scope="scope">
                <span>{{ scope.row.DATE_DELIVER | datatrans }}</span>
              </template>
            </el-table-column>
            <el-table-column prop="SUPPLY_CHECK_NOTES" label="说明" align="center" width="80">
            </el-table-column>
          </el-table>
        </div>
        <!-- 窗帘 -->
        <div v-if="orderNoPreFix == 'X'">
          <!-- 表头 -->
          <el-table :data="colName" :show-header="false" border class="tb_font14_bold" key="checkedX">
            <af-table-column prop="name1" label="位置" align="center" width="120"></af-table-column>
            <af-table-column prop="name2" label="名称" align="center" width="80"></af-table-column>
            <af-table-column prop="name3" label="编码" align="center" width="120"></af-table-column>
            <af-table-column prop="name4" label="名称" align="center" width="150"></af-table-column>
            <af-table-column prop="name5" label="规格:米/对" align="center" width="60"></af-table-column>
            <el-table-column prop="name6" label="用量" align="center" width="80"></el-table-column>
            <el-table-column prop="name7" label="含税单价" align="center" width="100"></el-table-column>
            <el-table-column prop="name8" label="金额" align="center" width="80"></el-table-column>
            <el-table-column prop="name9" label="制造说明" align="center" width="80"></el-table-column>
            <el-table-column prop="name10" label="备注" align="center" width="130"></el-table-column>
            <el-table-column prop="name11" label="生产备注" align="center"></el-table-column>
          </el-table>
          <div>
            <div v-for="(item, index) of items" :key="index">
              <!-- 帘款 -->
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
                    :span-method="function(col){ return arraySpanMethod(col,index)}" border size="small">
                    <el-table-column label="inner名称" align="center" width="80">
                      <template slot-scope="scope">{{ getTypeName(scope.row.cl_name) }}</template>
                    </el-table-column>
                    <el-table-column prop="item_no" label="inner编码" width="120"></el-table-column>
                    <el-table-column prop="mname" label="inner名称" header-align="center" width="150">
                    </el-table-column>
                    <el-table-column prop="grade" label="inner规格:米/对" header-align="center" width="60">
                    </el-table-column>
                    <el-table-column label="inner用量" align="right" width="80">
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
              <!-- 窗帘数据 -->
              <el-table class="tb_font12_bold" :show-header="false" :data="item.tab3[index]">
                <el-table-column label="预约" header-align="center" width="120"> <template slot-scope="scope">
                    {{scope.row.date_req}} </template></el-table-column>
                <el-table-column label="交货" header-align="center" width="200"><template slot-scope="scope">
                    {{scope.row.date_deliver}} </template></el-table-column>
                <el-table-column label="名称" header-align="center" width="150"></el-table-column>
                <el-table-column label="规格:米/对" header-align="center" align="center" width="60">
                </el-table-column>
                <el-table-column label="用量" header-align="center" align="center" width="80"></el-table-column>
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
            </div>
          </div>
          <!-- 底部统计 -->
          <el-table :data="sumMoneyCol" :show-header="false" class="tb_font14_bold" key="checkedXSum">
            <af-table-column prop="name1" width="120" label="位置"></af-table-column>
            <af-table-column prop="name2" width="80" label="名称"></af-table-column>
            <af-table-column prop="name3" width="120" label="编码"></af-table-column>
            <af-table-column prop="name4" label="名称" width="150"></af-table-column>
            <af-table-column prop="name5" label="规格:米/对" width="60"></af-table-column>
            <el-table-column prop="name6" label="用量" width="80"></el-table-column>
            <el-table-column prop="name7" label="含税单价" width="100" header-align="center" align="right">
            </el-table-column>
            <el-table-column label="金额" width="80" align="right">
              <template slot-scope="scope">
                {{scope.row.name8|numFilter}}
              </template>
            </el-table-column>
            <el-table-column prop="name9" label="制造说明" width="80"></el-table-column>
            <el-table-column prop="name10" label="备注"></el-table-column>
            <el-table-column prop="name11" label="生产备注"></el-table-column>
          </el-table>
        </div>
        <!-- 新窗帘 -->
        <div v-if="orderNoPreFix == 'N'">
          <el-table border :data="gridData" :row-class-name="headTableRowClassName" :expand-row-keys="expands"
            :row-key="getRowKeys" key="checkN" class="checkN">
            <el-table-column width="1" type="expand">
              <template slot-scope="scopeHead">
                <div class="curtain-list">
                  <el-table :data="scopeHead.row.curtains" ref="curtainTable" class="curtain-table" border
                    :row-class-name="tableRowClassName" show-summary :summary-method="getNSummaries">
                    <el-table-column label="部件" width="80" header-align="center" prop="NC_PART_TYPECODE">
                      <template slot-scope="scope">
                        <!-- 树缩进 -->
                        <span v-if="scope.row.curtain_level > 0">
                          <span :style="{'padding-left': scope.row.curtain_level * 16 + 'px'}"></span>
                        </span>
                        <span>{{transPartTypeCode(scope.row.NC_PART_TYPECODE)}}</span>
                      </template>
                    </el-table-column>
                    <el-table-column label="编码" width="140" header-align="center" prop="ITEM_NO">
                    </el-table-column>
                    <el-table-column label="名称" width="80" header-align="center" prop="CURTAIN_ITEM_NAME">
                    </el-table-column>
                    <el-table-column label="制造说明" width="250" header-align="center">
                      <template slot-scope="scope">
                        <!-- N个配置项逐个检测 -->
                        <!-- 宽，高 -->
                        <div class="manufacturing-ct" v-if="scope.row.WIDTH_ENABLE > 0 || scope.row.HEIGHT_ENABLE > 0">
                          <template v-if="scope.row.WIDTH_ENABLE == 1 || scope.row.WIDTH_ENABLE == 2">
                            <span>【宽】: {{ scope.row.WIDTH }}m</span>
                          </template>
                          <template v-if="scope.row.HEIGHT_ENABLE == 1 || scope.row.HEIGHT_ENABLE == 2">
                            <span>【高】: {{ scope.row.HEIGHT }}m</span>
                          </template>
                        </div>
                        <!-- 左右转角 -->
                        <div class="manufacturing-ct" v-if="scope.row.LEFT_ENABLE > 0 || scope.row.RIGHT_ENABLE > 0">
                          <template v-if="scope.row.LEFT_ENABLE == 1 || scope.row.LEFT_ENABLE == 2">
                            <span>【左转角】: {{ scope.row.LEFT_FILLET }}m</span>
                          </template>
                          <template v-if="scope.row.RIGHT_ENABLE == 1 || scope.row.RIGHT_ENABLE == 2">
                            <span>【右转角】: {{ scope.row.RIGHT_FILLET }}m</span>
                          </template>
                        </div>
                        <!-- 么术贴 -->
                        <div class="manufacturing-ct" v-if="scope.row.TIE_ENABLE > 0">
                          <template v-if="scope.row.TIE_ENABLE == 1 || scope.row.TIE_ENABLE == 2">
                            <span>【么术贴】: {{ scope.row.MESUTIE | meshutie_filter}}</span>
                          </template>
                        </div>
                        <!-- 打开方式 -->
                        <div class="manufacturing-ct" v-if="scope.row.KAIKOU_ENABLE > 0">
                          <template v-if="scope.row.KAIKOU_ENABLE == 1 || scope.row.KAIKOU_ENABLE == 2">
                            <span>【打开方式】: {{ scope.row.KAIKOU | kaikou_filter }}</span>
                          </template>
                        </div>
                        <!-- 工艺方式 -->
                        <div class="manufacturing-ct" v-if="scope.row.OPERATION_ENABLE > 0">
                          <template v-if="scope.row.OPERATION_ENABLE == 1 || scope.row.OPERATION_ENABLE == 2">
                            <span>【工艺方式】: {{ scope.row.OPERATION | operation_filter }}</span>
                          </template>
                        </div>
                        <!-- 包边方式 -->
                        <div class="manufacturing-ct" v-if="scope.row.BIAN_ENABLE > 0">
                          <template v-if="scope.row.BIAN_ENABLE == 1 || scope.row.BIAN_ENABLE == 2">
                            <span>【包边方式】: {{ scope.row.BIAN | bian_filter }}</span>
                          </template>
                        </div>
                        <!-- 说明 -->
                        <div class="manufacturing-ct"
                          v-if="scope.row.NCM_NOTE || scope.row.JOINT || scope.row.WRINKLE || scope.row.MAKETYPE ">
                          <span>【说明】: <template v-if="scope.row.MAKETYPE">{{scope.row.MAKETYPE | makeType_filter}}<template
                                v-if="scope.row.JOINT || scope.row.WRINKLE || scope.row.NCM_NOTE">、</template></template>
                            <template v-if="scope.row.JOINT">{{scope.row.JOINT | joint_filter}}<template
                                v-if="scope.row.WRINKLE || scope.row.NCM_NOTE">、</template></template>
                            <template v-if="scope.row.WRINKLE">{{scope.row.WRINKLE }}褶<template
                                v-if="scope.row.NCM_NOTE">、</template></template>
                            <template v-if="scope.row.NCM_NOTE">{{scope.row.NCM_NOTE }}</template></span>
                        </div>
                      </template>
                    </el-table-column>
                    <el-table-column label="褶数" width="50" align="center" prop="ZE_QTY">
                    </el-table-column>
                    <el-table-column label="用量" width="100" align="center" prop="DOSAGE">
                      <template slot-scope="scope">
                        <span v-if="scope.row.NC_PART_TYPECODE != 'LBT'">
                          {{scope.row.DOSAGE}}{{scope.row.UNIT_NAME}}
                        </span>
                        <span v-else>-</span>
                      </template>
                    </el-table-column>
                    <el-table-column label="含税单价" width="80" align="center" prop="PRICE_TAXIN">
                      <template slot-scope="scope">
                        <!-- 只有部件算钱 -->
                        <span v-if="scope.row.curtain_level == 0">{{scope.row.PRICE_TAXIN | numFilter}}</span>
                        <span v-else>-</span>
                      </template>
                    </el-table-column>
                    <el-table-column label="金额" width="80" align="center" prop="TOTAL_MONEY">
                      <template slot-scope="scope">
                        <!-- 只有部件算钱 -->
                        <span v-if="scope.row.curtain_level == 0">{{ scope.row.TOTAL_MONEY | numFilter }}</span>
                        <span v-else>-</span>
                      </template>
                    </el-table-column>
                    <el-table-column label="说明" width="100" header-align="center" prop="ILLUSTRATE">
                      <template slot-scope="scope">
                        <span style="color:red;font-size:12px;"> {{ scope.row.ILLUSTRATE }}</span>
                      </template>
                    </el-table-column>
                    <el-table-column label="客户备注" align="center" prop="NOTE">
                    </el-table-column>
                    <el-table-column label="兰居意见" header-align="center" prop="SUGGESTION">
                    </el-table-column>
                  </el-table>
                </div>
              </template>
            </el-table-column>
            <el-table-column align="center" prop="LINE_NO" label="序号" width="40"></el-table-column>
            <el-table-column align="center" prop="ITEM_NO" label="款号" width="100"></el-table-column>
            <el-table-column align="center" prop="BRAND_NAME" label="品牌" width="90"></el-table-column>
            <el-table-column align="center" prop="TYPE_NAME" label="类型" width="90"></el-table-column>
            <el-table-column prop="PRODUCTION_VERSION" align="center" label="所属版本" width="90"></el-table-column>
            <el-table-column label="销售状态" align="center" width="90">
              <template slot-scope="scope">
                <span>{{ scope.row.SALE_ID | transSaleId }}</span>
              </template>
            </el-table-column>
            <el-table-column align="center" prop="CURTAIN_WIDTH" label="成品宽" width="80"></el-table-column>
            <el-table-column align="center" prop="CURTAIN_HEIGHT" label="成品高" width="80"></el-table-column>
            <el-table-column align="center" prop="ANCAO_HEIGHT" label="暗槽高" width="80"></el-table-column>
            <el-table-column align="center" prop="CURTAIN_ROOM_NAME" label="位置" width="100"></el-table-column>
            <el-table-column align="center" prop="QTY_REQUIRED" label="套数" width="70"></el-table-column>
            <el-table-column prop="PROMOTION" align="center" label="活动" show-overflow-tooltip></el-table-column>
            <el-table-column align="center" prop="NOTES" label="备注"></el-table-column>
          </el-table>
          <div>
            <span style="font-size:16px;margin-left: 725px;">总金额：{{newCurtainTotalMoney}}</span></span>
          </div>
          <hr />
        </div>
      </div>
    </el-dialog>
  </el-card>
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
import { GetPartTypeDataTable, GetPurOrderDetails } from "@/api/newCurtainASP";
import { downLoadFile } from "@/common/js/downLoadFile";
import Cookies from "js-cookie";
import Axios from "axios";

export default {
  name: "supplyJuPort",
  data() {
    return {
      companyId: Cookies.get("companyId"),
      current_id: Cookies.get("cid"),
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
      items: [],
      purNo: "",
      customer: "",
      date1: this.getPastMonth(),
      date2: new Date(),
      now: new Date(),
      Month: new Date().getMonth() + 1,
      selvalue: "all",
      date_deliver: "",
      batchdate_deliver: "",
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
        { value: "efficient", label: "生效" },
        { value: "enforce", label: "执行" },
        { value: "fulfill", label: "完成" },
      ],
      //存一行的数据
      detailData: [{ cl_place: -1, cl_item_no: "D13445435" }],
      curtainPartTypeData: [], //类型字典
      orderNoPreFix: "",
      checkVisible: false,
      checkedVisible: false,
      expands: [],
      newCurtainTotalMoney: 0
    };
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
    transSaleId(value) {
      switch (value) {
        case "A":
          return "销售";
          break;
        case "B":
          return "待淘汰";
          break;
        case "C":
          return "淘汰";
          break;
        case "D":
          return "内留";
          break;
        case "E":
          return "外留";
          break;
        case "F":
          return "永久淘汰";
          break;
      }
    },
    meshutie_filter(value) {
      switch (value) {
        case "ZC":
          return "正车";
          break;
        case "FC":
          return "反车";
          break;
        default:
          return value;
          break;
      }
    },
    kaikou_filter(value) {
      switch (value) {
        case "TK":
          return "对开";
          break;
        case "DK":
          return "单开";
          break;
        case "SK":
          return "特殊开";
          break;
        default:
          return value;
          break;
      }
    },
    operation_filter(value) {
      switch (value) {
        case "GDZ":
          return "固定褶";
          break;
        case "DQ":
          return "打圈";
          break;
        default:
          return value;
          break;
      }
    },
    bian_filter(value) {
      switch (value) {
        case "4B":
          return "4S边";
          break;
        case "3B":
          return "3.0边";
          break;
        default:
          return value;
          break;
      }
    },
    makeType_filter(value) {
      switch (value) {
        case "01":
          return "定宽制作";
          break;
        case "02":
          return "定高制作";
          break;
      }
    },
    joint_filter(value) {
      switch (value) {
        case "SP":
          return "竖拼接";
          break;
        case "HP":
          return "横拼接";
          break;
      }
    },
  },
  methods: {
    getPartTypeData() {
      GetPartTypeDataTable().then((res) => {
        this.curtainPartTypeData = res.data;
      });
    },
    //PartType字典Filter
    transPartTypeCode(val) {
      var name = val;
      var typeCode = this.curtainPartTypeData.filter((item) => item.NC_PART_TYPECODE == val);
      if (typeCode.length) {
        name = typeCode[0].NC_PART_NAME;
      }
      return name;
    },
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
    //批量确认
    OneStepCheck() {
      if (this.multipleSelection.length == 0) {
        this.$alert("未选定任何项！", "提示", {
          confirmButtonText: "确定",
          type: "warning",
        });
      } else {
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
    numFilterMethod(value) {
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
          return this.transPartTypeCode(val);
      }
    },
    //获取产品类型
    getProductType(value) {
      if (value.substring(0, 1) == "X" || value.substring(0, 1) == "N") {
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
        this.purNo = "";
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
      if (this.purNo != "") {
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
          this.purNo = "";
          this.date1 = this.getPastMonth();
          this.date2 = this.getTodayMaxTime();
          break;
        case "second":
          this.bill_type = "PO";
          this.check_flag = 1;
          this.selvalue = "all";
          this.po_type = "all";
          this.purNo = "";
          this.date1 = this.getCurrentWeek();
          this.date2 = this.getTodayMaxTime();
          break;
        case "third":
          this.bill_type = "POT";
          this.check_flag = -99;
          this.selvalue = "cancel";
          this.po_type = "cancel";
          this.purNo = "";
          this.date1 = this.getCurrentWeek();
          this.date2 = this.getTodayMaxTime();
          break;
        case "forth":
          this.bill_type = "PT";
          this.check_flag = -99;
          this.selvalue = "all";
          this.po_type = "all";
          this.purNo = "";
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
          this.checkVisible = false;
        })
        .catch((res) => {
          this.$alert("保存失败，请稍后重试", "提示", {
            confirmButtonText: "确定",
            type: "warning",
          });
        });
    },
    returnMain() {
      this.checkVisible = false;
      this.checkedVisible = false;
    },
    //手动确认订单
    SubmitVue() {
      this.pur_headForm.SUPPLY_CHECK_NOTES = this.supply_check_notes;
      if (this.orderNoPreFix == "X" || this.orderNoPreFix == "N") {
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
            this.checkVisible = false;
            //同步布精灵数据
            if (res.data.length) {
              await this.asyncBuJingLing([
                { PUR_NO: res.data[0].PUR_NO, data: res.data, newcurtaindata: this.gridData },
              ]);
            }
            this.checkedVisible = true;
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
            this.checkVisible = false;
            this.checkedVisible = true;
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
          GetBJLData({ ORDER_NO: row.ORDER_NO, PUR_NO: row.PUR_NO }).then(async (res) => {
            if (res.data.data && res.data.data.length) {
              await this.asyncBuJingLing([
                { PUR_NO: row.PUR_NO, data: res.data.data, newcurtaindata: res.data.newcurtaindata },
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
        .catch(() => { });
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
        //循环有多少个采购单
        for (var i = 0; i < pruData.length; i++) {
          //一个单n个位置的窗帘就要post n次
          var onedata = pruData[i].data;
          var oneFail = "";
          if (onedata.length) {
            var orderNo = onedata[0].ORDER_NO;
            if (orderNo.substring(0, 1) == "X") {
              //旧窗帘
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
                console.log(oneplace)
                //找各种款式
                var ltlist = oneplace.filter((item) => item.CL_NAME == "lt");
                var lslist = oneplace.filter((item) => item.CL_NAME == "ls");
                var shalist = oneplace.filter((item) => item.CL_NAME == "sha");

                var lsHeight = 0;
                var lsWidth = 0;
                var lsOpen = "";
                var lsOperation = "";
                if (lslist.length) {
                  lsHeight = lslist[0].HEIGHT;
                  lsWidth = lslist[0].WIDTH;
                  lsOpen = this.$options.filters.kaikou_filter(lslist[0].PRODUCT_NOTE);
                  //工艺方式
                  var operationForLs = lslist.filter(item => item.ITEM_NO.indexOf('GY') > -1);
                  if(operationForLs.length){
                    lsOperation = operationForLs[0].MNAME;
                  }
                }
                var shaHeight = 0;
                var shaWidth = 0;
                var shaOpen = "";
                var shaOperation = "";
                if (shalist.length) {
                  shaHeight = shalist[0].HEIGHT;
                  shaWidth = shalist[0].WIDTH;
                  shaOpen = this.$options.filters.kaikou_filter(shalist[0].PRODUCT_NOTE);
                  //工艺方式
                  var operationForSha = shalist.filter(item => item.ITEM_NO.indexOf('GY') > -1);
                  if(operationForSha.length){
                    shaOperation = operationForSha[0].MNAME;
                  }
                }

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
                  lianshenOpen: lsOpen,
                  lianshenType: lsOperation,
                  chuangshaHeight: oneplace[0].CL_HIGH,
                  chuangshaWidth: oneplace[0].CL_WIDTH,
                  chuangshaOpen: shaOpen,
                  chuangshaType: shaOperation,
                  subcustmorname: detail.PUR_NO,
                  zswz: oneplace[0].CL_PLACE,
                  onlineDanhao: oneplace[0].ORDER_NO,
                  data: JSON.stringify(detailData)
                };
                console.log(1)
                console.log(postdata)
                Axios.defaults.withCredentials = false;
                try {
                  var resB = await Axios.post(
                    "http://ljsp.ubxiu.com:8098/syn/add",
                    //"http://buyisoft.utools.club/syn/add",
                    //"http://buyisoft.cn.utools.club/syn/add",
                    postdata,
                    { params: postdata, loading: false }
                  );
                  console.log(resB)
                  if (resB.data.state == "ok") {
                  } else {
                    var msg = pruData[i].PUR_NO + "位置:" + oneplace[0].CL_PLACE + "同步失败;";
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
            else if (orderNo.substring(0, 1) == "N") {
              //新窗帘
              var orderDetailData = pruData[i].newcurtaindata;
              //一个明细就是一个位置
              for (var j = 0; j < orderDetailData.length; j++) {
                var oneOrderDetail = orderDetailData[j];
                var oneplace = orderDetailData[j].curtains;
                var detailData = [];
                for (var d = 0; d < oneplace.length; d++) {
                  var detail = oneplace[d];
                  //找各种款式
                  var ltlist = oneplace.filter((item) => item.NC_PART_TYPECODE == "LT");
                  var lslist = oneplace.filter((item) => item.NC_PART_TYPECODE == "LS");
                  var shalist = oneplace.filter((item) => item.NC_PART_TYPECODE == "CS");
                  var typeCode = detail.NC_PART_TYPECODE;
                  if (detail.NCM_PID != 0) {
                    //找父节点
                    var fatherCurtain = oneplace.filter(item => item.NC_MODEL_ID == detail.NCM_PID);
                    if (fatherCurtain.length) {
                      typeCode = fatherCurtain[0].NC_PART_TYPECODE;
                    }
                  } else if (typeCode != "LT" || typeCode != "LS" || typeCode != "CS") {
                    if (typeCode == "LCB") {
                      typeCode = "LS";
                    } else if (typeCode == "GBD") {
                      if (lslist.length) {
                        typeCode = "LS";
                      } else if (shalist.length) {
                        typeCode = "CS";
                      } else if (ltlist.length) {
                        typeCode = "LT";
                      }
                    }
                  }
                  var onedetail = {
                    buwei: typeCode,
                    leibie: this.transPartTypeCode(detail.NC_PART_TYPECODE),
                    code: detail.ITEM_NO,
                    danwei: detail.UNIT_NAME,
                    price: detail.PRICE_TAXIN,
                    guige: detail.FIX_GRADE,
                    shuliang: detail.DOSAGE,
                    shenhe2Des: detail.PRODUCT_NOTE,
                    beizhu: detail.NOTE + detail.ILLUSTRATE,
                    zheshu: detail.ZE_QTY
                  };
                  detailData.push(onedetail);
                }
                var ltHeight = 0;
                var ltWidth = 0;
                var ltLeft = 0;
                var ltRight = 0;
                var ltMesutie = "";
                if (ltlist.length) {
                  ltHeight = ltlist[0].HEIGHT;
                  ltWidth = ltlist[0].WIDTH;
                  ltLeft = ltlist[0].LEFT_FILLET;
                  ltRight = ltlist[0].RIGHT_FILLET;
                  ltMesutie = this.$options.filters.meshutie_filter(ltlist[0].MESUTIE);
                }
                var lsHeight = 0;
                var lsWidth = 0;
                var lsOpen = "";
                var lsOperation = "";
                var lsZe = 0;
                if (lslist.length) {
                  lsHeight = lslist[0].HEIGHT;
                  lsWidth = lslist[0].WIDTH;
                  lsOpen = this.$options.filters.kaikou_filter(lslist[0].KAIKOU);
                  lsOperation = this.$options.filters.operation_filter(lslist[0].OPERATION);
                  lsZe = lslist[0].ZE_QTY;
                }
                var shaHeight = 0;
                var shaWidth = 0;
                var shaOpen = "";
                var shaOperation = "";
                var shaZe = 0;
                if (shalist.length) {
                  shaHeight = shalist[0].HEIGHT;
                  shaWidth = shalist[0].WIDTH;
                  shaOpen = this.$options.filters.kaikou_filter(shalist[0].KAIKOU);
                  shaOperation = this.$options.filters.operation_filter(shalist[0].OPERATION);
                  shaZe = shalist[0].ZE_QTY;
                }

                var postdata = {
                  token: "ljsp-bjl",
                  cpPlaceId: oneOrderDetail.LINE_NO,
                  custmorname: oneOrderDetail.CUSTOMER_NAME,
                  sortname: oneOrderDetail.CUSTOMER_CODE,
                  tempCustmorjc: oneOrderDetail.LINKPERSON,
                  tempPhone: oneOrderDetail.TELEPHONE,
                  tempAddress: oneOrderDetail.POST_ADDRESS,
                  templatename: oneOrderDetail.ITEM_NO,
                  liantou: ltlist.length > 0,
                  lianshen: lslist.length > 0,
                  chuangsha: shalist.length > 0,
                  liantouHeight: ltHeight,
                  liantouWidth: ltWidth,
                  liantouLeft: ltLeft,
                  liantouRight: ltRight,
                  liantouMoshutie: ltMesutie,
                  lianshenHeight: lsHeight,
                  lianshenWidth: lsWidth,
                  lianshenOpen: lsOpen,
                  lianshenType: lsOperation,
                  chuangshaHeight: shaHeight,
                  chuangshaWidth: shaWidth,
                  chuangshaOpen: shaOpen,
                  chuangshaType: shaOperation,
                  subcustmorname: pruData[i].PUR_NO,
                  zswz: oneOrderDetail.CURTAIN_ROOM_NAME,
                  onlineDanhao: oneOrderDetail.ORDER_NO,
                  data: JSON.stringify(detailData),
                  //新窗帘新增
                  orderVolume: oneOrderDetail.QTY_REQUIRED,
                  beizhu: oneOrderDetail.NOTES + oneOrderDetail.YULAN_NOTES,
                  jiaofuriqi: oneOrderDetail.JIAOHUO_DATE,
                  lianshenZhewei: lsZe,
                  chuangshaZhewei: shaZe,
                  goodSize: "W" + oneOrderDetail.CURTAIN_WIDTH.toString() + "_H" + oneOrderDetail.CURTAIN_HEIGHT.toString() + "_AC" + oneOrderDetail.ANCAO_HEIGHT.toString()
                };
                //console.log(postdata)
                Axios.defaults.withCredentials = false;
                try {
                  var resB = await Axios.post(
                    "http://ljsp.ubxiu.com:8098/syn/add",
                    //"http://buyisoft.utools.club/syn/add",
                    //"http://buyisoft.cn.utools.club/syn/add",
                    postdata,
                    { params: postdata, loading: false }
                  );
                  if (resB.data.state == "ok") {
                  } else {
                    var msg = pruData[i].PUR_NO + "位置:" + oneOrderDetail.LINE_NO + "同步失败;";
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
          }
          if (!oneFail) {
            //一个单同步成功的修改同步状态
            var resC = await AsyncBuJingLing(
              { PUR_NO: pruData[i].PUR_NO },
              { loading: false }
            );
            console.log(resC)
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
        customer: this.customer == null || this.customer == "" ? "all" : this.customer,
        po_type: this.po_type, //  status状态   cancel    efficient 生效（新采购单）   enforce 已执行（已确认）   fulfill 已完成
        check_flag: this.check_flag,
        beginTime: this.getBegintime(this.date1),
        finishTime: this.getEndtime(this.date2),
        po: this.purNo,
        bill_type: this.bill_type,
      };
      GetRelativePo(data).then(res => {
          this.count = res.count;
          this.pur_headData = res.data;
          this.pur_headData.forEach((item) => {
            item.PRINTED = item.PRINTED === "1" ? true : false;
          });
        }
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
      var purNo = this.purNo;

      downLoadFile(
        this.Global.baseUrl +
        `PUR_HEAD/SalExcel?current_id=${current_id}&customer=${customer}&po_type=${po_type}&check_flag=${check_flag}&beginTime=${beginTime}&finishTime=${finishTime}&po=${purNo}`
      );
    },
    downLoadX() {
      var PUR_NO = this.pur_headForm.PUR_NO;

    },
    downLoadY() {
      var PUR_NO = this.pur_headForm.PUR_NO;
      if (this.orderNoPreFix != "X" && this.orderNoPreFix != "N") {
        downLoadFile(this.Global.baseUrl + `PUR_HEAD/CreateExcelY?PUR_NO=${PUR_NO}`);
      } else if (this.orderNoPreFix == "X") {
        downLoadFile(this.Global.baseUrl + `PUR_HEAD/CreateExcel?PUR_NO=${PUR_NO}`);
      } else if (this.orderNoPreFix == "N") {
        downLoadFile(this.Global.baseUrl + `PUR_HEAD/CreateExcelN?PUR_NO=${PUR_NO}`);
      }
    },
    downLoadAll() {
      var cid = this.companyId;
      var purNo = this.purNo == null || this.purNo == "" ? "all" : this.purNo;
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
        `PUR_HEAD/HeadAndDetailExcel?cid=${cid}&po=${purNo}&customer=${customer}&beginTime=${beginTime}&finishTime=${finishTime}&po_type=${po_type}&bill_type=${bill_type}`
      );
    },
    autoSearchDetail(row) {
      this.orderNoPreFix = row.ORDER_NO.substring(0, 1);
      this.gridData = [];
      this.pur_headForm = {};
      GetPoDetail({ PUR_NO: row.PUR_NO }).then((res) => {
        this.pur_headForm.PUR_NO = row.PUR_NO;
        this.pur_headForm.LINKMAN = res.data[0].LINKMAN;
        this.pur_headForm.DATE_PUR = res.data[0].DATE_PUR;
        this.pur_headForm.DATE_DELIVER = res.data[0].DATE_DELIVER;
        this.pur_headForm.NOTES = res.data[0].NOTES;
        this.pur_headForm.SUPPLY_CHECK_NOTES = res.data[0].SUPPLY_CHECK_NOTES;
        this.pur_headForm.DEPT_NO = res.data[0].DEPT_NO;
        this.pur_headForm.DEPT_NO2 = res.data[0].DEPT_NO2;
        this.pur_headForm.SUPPLY_CODE = res.data[0].SUPPLY_CODE;
        this.pur_headForm.G_ADDRESS = res.data[0].G_ADDRESS;
        this.pur_headForm.G_LINK = res.data[0].G_LINK;
        this.pur_headForm.G_TYPE = res.data[0].G_TYPE;
        this.pur_headForm.G_PHONE = res.data[0].G_PHONE;
        this.pur_headForm.HANDSET = res.data[0].HANDSET;
        this.pur_headForm.ORDER_NO = res.data[0].ORDER_NO;
        this.pur_headForm.OA_NO = res.data[0].OA_NO;
        this.pur_headForm.ORDER_MAN = res.data[0].ORDER_MAN;
        this.pur_headForm.CUSTOMER_NAME = res.data[0].CUSTOMER_NAME;
        this.pur_headForm.PUR_MYFACT = res.data[0].PUR_MYFACT;
        this.pur_headForm.BUYER = res.data[0].BUYER;
        this.pur_headForm.PAY_TYPE = res.data[0].PAY_TYPE;
        this.pur_headForm.PAY_DATELIMIT = res.data[0].PAY_DATELIMIT;
        this.pur_headForm.C_BANK = res.data[0].C_BANK;
        this.pur_headForm.C_ADDRESS = res.data[0].C_ADDRESS;
        this.pur_headForm.C_POST = res.data[0].C_POST;
        this.pur_headForm.C_BANKNO = res.data[0].C_BANKNO;
        this.pur_headForm.C_TAX = res.data[0].C_TAX;
        this.pur_headForm.OWN_TEL = res.data[0].OWN_TEL;
        this.pur_headForm.LINKTEL = res.data[0].LINKTEL;
        this.pur_headForm.POST_ADDRESS = res.data[0].POST_ADDRESS;
        this.pur_headForm.STATUS = res.data[0].STATUS;
        this.pur_headForm.CONTRACT_NO = res.data[0].CONTRACT_NO;

        this.supply_check_notes = this.pur_headForm.SUPPLY_CHECK_NOTES;
        this.date_deliver = "";

        if (this.orderNoPreFix == "X") {
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
          var sumMoney = 0;
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
                sumMoney += this.gridData[i].TOTAL_MONEY;
                this.sumMoneyCol[0].name8 = sumMoney;
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

          if (row.SUPPLY_CHECK_FLAG === "0") {
            this.checkVisible = true;
          } else {
            this.checkedVisible = true;
          }
        } else if (this.orderNoPreFix == "N") {
          this.expands = []
          GetPurOrderDetails({ orderNo: row.ORDER_NO, purNo: row.PUR_NO }).then(res => {
            this.gridData = res.data;
            for (let i = 0; i < this.gridData.length; i++) {
              var detail = this.gridData[i];
              if (this.expands.indexOf(detail.LINE_NO) == -1)
                this.expands.push(detail.LINE_NO);
              for (var j = 0; j < detail.curtains.length; j++) {
                var oneCurtain = detail.curtains[j];
                //窗帘层级
                var level = 0;
                var NCM_PID = oneCurtain.NCM_PID;
                while (NCM_PID != 0) {
                  var temp = detail.curtains.filter((item) => item.NC_MODEL_ID == NCM_PID);
                  if (temp.length) {
                    NCM_PID = temp[0].NCM_PID;
                    level++;
                  }
                }
                this.$set(oneCurtain, "curtain_level", level);
              }
            }
            this.newCurtainTotalMoney = this.getNSummariesAll();
            if (row.SUPPLY_CHECK_FLAG === "0") {
              this.checkVisible = true;
            } else {
              this.checkedVisible = true;
            }
          })
        } else {
          this.gridData = res.data;

          if (row.SUPPLY_CHECK_FLAG === "0") {
            this.checkVisible = true;
          } else {
            this.checkedVisible = true;
          }
        }

      });
    },
    getYSummaries(param) {
      const { columns, data } = param;
      const sums = [];
      columns.forEach((column, index) => {
        if (index === 7) {
          sums[index] = '汇总';
          return;
        }
        if (index == 8) {
          const values = data.map(item => Number(item[column.property]));
          if (!values.every(value => isNaN(value))) {
            sums[index] = values.reduce((prev, curr) => {
              const value = Number(curr);
              if (!isNaN(value)) {
                return prev.add(curr);
              } else {
                return prev;
              }
            }, 0);
            sums[index] = this.numFilterMethod(sums[index]);
          } else {
            sums[index] = 'N/A';
          }
        }
      });

      return sums;
    },
    getNSummaries(param) {
      const { columns, data } = param;
      const sums = [];
      columns.forEach((column, index) => {
        if (index === 6) {
          sums[index] = '小计';
          return;
        }
        if (index == 7) {
          const values = data.map(item => Number(item[column.property]));
          if (!values.every(value => isNaN(value))) {
            sums[index] = values.reduce((prev, curr) => {
              const value = Number(curr);
              if (!isNaN(value)) {
                return prev.add(curr);
              } else {
                return prev;
              }
            }, 0);
            sums[index] = this.numFilterMethod(sums[index]);
          } else {
            sums[index] = 'N/A';
          }
        }
      });

      return sums;
    },
    getNSummariesAll(param) {
      var totalMoney = 0;
      const values = this.gridData.map(item => item.curtains);
      var columCol = [
        {}, {}, {}, {}, {}, {}, {},
        {
          property: 'TOTAL_MONEY'
        }
      ]

      totalMoney = values.reduce((prev, curr) => {
        var currVal = this.getNSummaries({ columns: columCol, data: curr });
        const value = Number(currVal[7]);
        if (!isNaN(value)) {
          return prev.add(currVal[7]);
        } else {
          return prev;
        }
      }, 0);
      totalMoney = this.numFilterMethod(totalMoney);

      return totalMoney;
    },
    getRowKeys(row) {
      return row.LINE_NO;
    },
    headTableRowClassName({ row, rowIndex }) {
      return "success-row";
    },
    tableRowClassName({ row, rowIndex }) {
      if (row.curtain_level == 0) {
        return 'bold-row';
      } else {
        return 'fade-row';
      }
      return '';
    },
  },
  created() {
    this.po_type = "all";
    this.autoSearch();
    this.getPartTypeData();
  },
};
</script>

<style scoped>
.customerInfo {
  width: 100%;
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
.manufacturing-ct {
  margin-bottom: 0;
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
.checkN .el-icon-arrow-right:before {
  content: "";
}
.curtain-list .el-table td,
.curtain-list .el-table th {
  padding: 1px 0 !important;
}
.curtain-list .el-table .cell {
  padding: 0 2px !important;
  overflow: inherit !important;
}
.curtain-list .el-table .bold-row {
  font-weight: bold;
}
.curtain-list .el-table .fade-row {
  color: #b0b4bb;
}
</style>