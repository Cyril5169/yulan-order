<template>
  <div>
    <el-card shadow="hover" class="centerCard">
      <div slot="header">
        <span class="fstrong f16">退款赔偿</span>
      </div>
      <div>
        <div class="tbarStyle">
          <span style="font-size:15px;margin-right:5px">建立日期:</span>
          <el-date-picker value-format="yyyy-MM-dd" style="width:14%;margin-right:25px" v-model="beginTime" type="date"
            placeholder="日期区间">
          </el-date-picker>
          <span style="font-size:15px;margin-right:35px">至</span>
          <el-date-picker value-format="yyyy-MM-dd" style="width:14%;margin-right:10px;" v-model="finishTime"
            type="date" placeholder="日期区间">
          </el-date-picker>
          <span style="font-size:15px;margin-right:31px">状态:</span>
          <el-select style="width:14%;margin-right:10px;" v-model="SELECT_STATUS" placeholder="请选择">
            <el-option v-for="item in statusArray" :key="item.value" :label="item.label" :value="item.value">
            </el-option>
          </el-select>
          <el-button type="success" @click.native="clickSearch" style="margin-right:6px;">查 询</el-button>
          <el-button type="warning" @click.native="resetSearch" style="margin-right:6px;">重 置</el-button>
        </div>
        <div class="tbarStyle">
          <span style="font-size:15px;margin-right:24px">型号：</span>
          <el-input clearable v-model="selectItemNo" style="width:14%;margin-right:10px;" placeholder="产品型号">
          </el-input>
          <span style="font-size:15px;margin-right:5px">客户名：</span>
          <el-input clearable v-model="selectCNAME" style="width:14%;margin-right:10px;" placeholder="客户名">
          </el-input>
          <span style="font-size:15px;margin-right:5px">处理人：</span>
          <el-input clearable style="width:14%;margin-right:10px;" v-model="selectDealor" placeholder="处理人">
          </el-input>
          <el-button @click.native="checkNoPrint" style="margin-right:6px;width:168px">查看未打印
          </el-button>
        </div>
        <el-table border :row-class-name="tableRowClassName" :data="tableData" style="width: 100%">
          <el-table-column width="130" label="编号" prop="ID" align="center">
          </el-table-column>
          <el-table-column width="145" label="创建时间" align="center">
            <template slot-scope="scope">
              {{ scope.row.CREATE_TS | datatrans }}
            </template>
          </el-table-column>
          <el-table-column label="客户名称" prop="CNAME" align="center">
          </el-table-column>
          <el-table-column width="90" label="联系人" prop="CONTACT_MAN" align="center">
          </el-table-column>
          <el-table-column width="120" label="联系电话" prop="CONTACT_PHONE" align="center">
          </el-table-column>
          <el-table-column width="70" label="货品数" prop="ITEM_COUNT" align="center">
          </el-table-column>
          <el-table-column width="120" label="状态" align="center">
            <template slot-scope="scope">
              {{ scope.row.STATE | transStatus }}
            </template>
          </el-table-column>
          <el-table-column label="处理人" prop="DEALMAN_NAME" align="center">
            <template slot-scope="scope">
              {{  DealManTrans(scope.row) }}
            </template>
          </el-table-column>

          <!-- 未做 -->
          <el-table-column width="100" label="操作" align="center">
            <template slot-scope="scope">
              <el-tooltip content="查看" placement="top">
                <el-button circle style="padding: 7px;" type="warning" icon="el-icon-search" size="mini"
                  @click="_CheckDetail(scope.row, 1)">
                </el-button>
              </el-tooltip>
              <el-tooltip v-if="
                  scope.row.STATE == 'SUBMITTED' ||
                    scope.row.STATE == 'RECEIVE' ||
                    scope.row.STATE == 'CUSTOMERAFFIRM' ||
                    scope.row.STATE == 'SENDBACK'
                " content="编辑" placement="top">
                <el-button circle style="padding: 7px;" @click="_CheckDetail(scope.row, 2)" type="primary"
                  icon="el-icon-edit" size="mini">
                </el-button>
              </el-tooltip>
            </template>
          </el-table-column>
          <el-table-column width="100" label="打印标记" prop="PRINTED" align="center">
            <template slot-scope="scope">
              <el-checkbox v-if="scope.row.STATE === 'APPROVED'" @change="changePrinted(scope.row, scope.$index)"
                v-model="scope.row.PRINTED">
                {{ scope.row.PRINTED === false ? "未打印" : "已打印" }}
              </el-checkbox>
            </template>
          </el-table-column>
        </el-table>
        <el-pagination style="width: 100%;" class="dib tc" @current-change="handleCurrentChange"
          :current-page.sync="currentPage" :page-size="pageSize" layout="total, prev, pager, next, jumper"
          :total="allNum">
        </el-pagination>
      </div>
    </el-card>
    <div>
      <el-dialog :visible.sync="RefundDetail" :close-on-click-modal="false" width="55%" append-to-body>
        <!-- 查看区 -->
        <div v-show="isCheck" id="printTable">
          <div style="margin-bottom:5px;">
            <table width="100%" border="0" cellspacing="0" cellpadding="0">
              <tr>
                <td style="font-size:20px;height:30px;text-align:center;" colspan="8">
                  退货/赔偿电子申请书【{{ submit.STATE | transStatus }}】
                  <i class="icon-print el-icon-printer cpoi" style="float:right" @click="printRefund"></i>
                </td>
              </tr>
            </table>
          </div>
          <div>
            <table width="100%" border="0" cellspacing="0" cellpadding="0">
              <tr>
                <td style="font-size:10px;height:15px;width:6%;" colspan="1">
                  编号：
                </td>
                <td style="font-size:10px;height:15px;text-align:left;width:15%;" colspan="1">
                  {{ submit.ID }}
                </td>
                <td style="font-size:10px;height:15px;width:9%;" colspan="1">
                  创建时间：
                </td>
                <td style="font-size:10px;height:15px;text-align:left;width:17%;" colspan="3">
                  {{ submit.CREATE_TS | datatrans }}
                </td>
                <td style="font-size:10px;height:15px;width:8%;" colspan="1" v-if="submit.STATE !='SUBMITTED'">
                  处理人：
                </td>
                <td style="font-size:10px;height:15px;width:8%;" colspan="1" v-else></td>
                <td style="font-size:10px;height:15px;text-align:left;width:19%;" colspan="1"
                  v-if="submit.STATE !='SUBMITTED'">
                  {{ submit.DEALMAN_NAME }}
                </td>
                <td style="font-size:10px;height:15px;width:19%;" colspan="1" v-else></td>
                <td style="font-size:10px;height:15px;width:9%;" colspan="1" v-if="submit.STATE !='SUBMITTED'">
                  处理时间：
                </td>
                <td style="font-size:10px;height:15px;width:9%;" colspan="1" v-else></td>
                <td style="font-size:10px;height:15px;text-align:left;width:17%;" colspan="3"
                  v-if="submit.STATE !='SUBMITTED'">
                  {{ submit.DEAL_TS | datatrans }}
                </td>
                <td style="font-size:10px;height:15px;width:17%;" colspan="1" v-else></td>
              </tr>
            </table>
          </div>
          <div class="table-c" style="margin-top:5px;">
            <table width="100%" border="0" cellspacing="0" cellpadding="0">
              <tr>
                <td class="grayTD" style="height:15px" colspan="1">客户代码</td>
                <td style="height:15px" colspan="1">
                  {{ submit.CID }}
                </td>
                <td class="grayTD" style="height:15px" colspan="1">客户名称</td>
                <td style="height:15px" colspan="5">
                  {{ submit.CNAME }}
                </td>
              </tr>
              <tr>
                <td class="grayTD" style="height:15px" width="12%">提货单号</td>
                <td style="height:15px" width="14%">{{ submit.SALE_NO }}</td>
                <td class="grayTD" style="height:15px" width="10%">B2B订单号</td>
                <td style="height:15px" colspan="2" width="16%">{{ submit.ORDER_NO }}</td>
                <!-- 连表查询 -->
                <td class="grayTD" style="height:15px" width="13%">ERP订单号</td>
                <td style="height:15px" colspan="2">
                  {{ submit.CONTRACT_NO }}
                </td>
                <!-- 连表查询 -->
              </tr>
              <tr>
                <td class="grayTD" style="height:15px">联系人</td>
                <td style="height:15px">{{ submit.CONTACT_MAN }}</td>
                <td class="grayTD" style="height:15px">联系电话</td>
                <td style="height:15px" colspan="2">
                  {{ submit.CONTACT_PHONE }}
                </td>
                <td class="grayTD" style="height:15px">物流单号</td>
                <td style="height:15px" colspan="2">{{ submit.TRANS_ID }}</td>
                <!-- 连表查询 -->
              </tr>
              <tr>
                <td class="grayTD" style="height:15px">问题描述</td>
                <td style="height:15px" colspan="7">{{ submit.NOTES }}</td>
              </tr>
              <tr>
                <td class="grayTD" colspan="1" style="height:15px">
                  产品/项目
                </td>
                <td class="grayTD" colspan="2" style="height:15px">型号</td>
                <td class="grayTD" colspan="1" style="height:15px">单位</td>
                <td class="grayTD" colspan="1" style="height:15px">数量</td>
                <td class="grayTD" colspan="3" style="height:15px">
                  上传相关信息
                </td>
              </tr>
              <tr>
                <td colspan="1" style="height:21px">
                  {{ submit.PRODUCTION_VERSION }}
                </td>
                <td colspan="2" style="height:21px">{{ submit.ITEM_NO }}</td>
                <td colspan="1" style="height:21px">{{ submit.UNIT }}</td>
                <td colspan="1" style="height:21px">{{ submit.QTY }}</td>
                <td colspan="3" style="height:21px">
                  <ul class="el-upload-list el-upload-list--text">
                    <li v-for="(file, index) in fileList" :key="index" class="el-upload-list__item is-success"
                      tabindex="0">
                      <a class="el-upload-list__item-name">
                        <el-link type="primary" size="mini" @click="showImage(file.url)"
                          @mouseenter.native="showMiniImage($event, file.url)" @mouseout.native="MiniPic = false">
                          {{ file.name }}
                        </el-link>
                      </a>
                      <label style="display:block;position:absolute;top:1px;right:10px;">
                        <a style="cursor:pointer;" @click="downLoad(file.url)">下载</a>
                      </label>
                    </li>
                  </ul>
                </td>
              </tr>
              <tr v-if="submit.STATE == 'SENDBACK'">
                <td class="grayTD" style="font-size:20px;height:30px" colspan="8">
                  玉兰处理意见
                </td>
              </tr>
              <tr v-if="submit.STATE == 'SENDBACK'">
                <td class="grayTD" style="height:15px" colspan="1">
                  初审意见或退回原因<span style="color:red;">*</span>
                </td>
                <td style="height:15px" colspan="7">
                  {{ submit.FIRST_AUDITION }}
                </td>
              </tr>
              <tr v-if="submit.STATE != 'SUBMITTED' && submit.STATE != 'SENDBACK'">
                <td class="grayTD" style="font-size:20px;height:30px" colspan="8">
                  玉兰处理意见
                </td>
              </tr>
              <tr v-if="submit.STATE != 'SUBMITTED' && submit.STATE != 'SENDBACK'">
                <td class="grayTD" style="height:15px" colspan="1">
                  初审意见<span style="color:red;">*</span>
                </td>
                <td style="height:15px" colspan="2">
                  {{ submit.RETURN_TYPE }}
                </td>
                <td style="height:15px" colspan="5">
                  {{ submit.FIRST_AUDITION }}
                </td>
              </tr>
              <tr v-if="
                  submit.STATE != 'SUBMITTED' &&
                    submit.STATE != 'SENDBACK' &&
                    submit.RETURN_TYPE != '无需退货'
                ">
                <td class="grayTD" style="height:15px">备注信息</td>
                <td style="height:15px" colspan="7" v-if="submit.RETURN_TYPE == '玉兰取货'">
                  我公司已安排物流公司上门取货，请保持电话畅通
                </td>
                <td style="height:15px" colspan="7" v-if="submit.RETURN_TYPE == '客户邮寄'">
                  请您在快递单上备注提货单号
                </td>
                <td style="height:15px" colspan="7" v-else></td>
              </tr>
              <tr v-if="
                  submit.STATE != 'SUBMITTED' &&
                    submit.STATE != 'SENDBACK' &&
                    submit.RETURN_TYPE == '客户邮寄'
                ">
                <td class="grayTD" style="height:15px">退货或寄样信息</td>
                <td style="height:15px" colspan="7">
                  {{ submit.RETURN_ADDRESS }}
                </td>
              </tr>
              <tr v-if="
                  submit.STATE != 'SUBMITTED' &&
                    submit.STATE != 'SENDBACK' &&
                    submit.RETURN_TYPE == '客户邮寄'
                ">
                <td class="grayTD" style="height:15px">邮寄备注信息</td>
                <td style="height:15px" colspan="7">
                  您的提货单号为{{ submit.SALE_NO }}
                </td>
              </tr>
              <tr v-if="
                  submit.STATE != 'SUBMITTED' &&
                    submit.STATE != 'SENDBACK' &&
                    submit.RETURN_TYPE == '客户邮寄'
                ">
                <td class="grayTD" style="height:15px">物流备注信息</td>
                <td style="height:15px;color:red;" colspan="7"
                  v-if="!submit.RETURN_TRANSINFO && submit.STATE == 'RECEIVE'">
                  {{ submit.RETURN_TRANSINFO | transInfoTip }}
                </td>
                <td style="height:15px;" colspan="7" v-if="!submit.RETURN_TRANSINFO && submit.STATE != 'RECEIVE'">
                  {{ submit.RETURN_TRANSINFO | transInfoTip }}
                </td>
                <td style="height:15px;" colspan="7" v-if="submit.RETURN_TRANSINFO !== ''">
                  {{ submit.RETURN_TRANSINFO }}
                </td>
              </tr>
              <!-- 初审意见附件下载 -->
              <tr v-if="submit.STATE != 'SUBMITTED'&&submit.STATE != 'SENDBACK'">
                <td class="grayTD" style="height:15px" colspan="1">附件</td>
                <td style="height:15px" colspan="7">
                  <ul class="el-upload-list el-upload-list--text">
                    <li v-for="(file, index) in fileListForAudition" :key="index"
                      class="el-upload-list__item is-success" tabindex="0">
                      <a class="el-upload-list__item-name">
                        <el-link type="primary" size="mini" @click="showImage(file.url)"
                          @mouseenter.native="showMiniImage($event, file.url)" @mouseout.native="MiniPic = false">
                          {{ file.name }}
                        </el-link>
                      </a>
                      <label style="display:block;position:absolute;top:1px;right:10px;">
                        <a style="cursor:pointer;" @click="downLoad(file.url)">下载</a>
                      </label>
                    </li>
                  </ul>
                </td>
              </tr>
              <tr v-if="
                  submit.STATE == 'CUSTOMERAFFIRM' || submit.STATE == 'APPROVED'
                ">
                <td class="grayTD" style="font-size:20px;height:30px" colspan="8">
                  玉兰处理结果
                </td>
              </tr>
              <tr v-if="
                  submit.STATE == 'CUSTOMERAFFIRM' || submit.STATE == 'APPROVED'
                ">
                <td class="grayTD" style="width:12%;height:15px">产品/项目</td>
                <td class="grayTD" style="width:14%;height:15px">型号</td>
                <td class="grayTD" style="width:10%;height:15px">单位</td>
                <td class="grayTD" style="width:8%;height:15px">数量</td>
                <td class="grayTD" style="width:8%;height:15px">金额</td>
                <td class="grayTD" style="width:13%;height:15px">质量问题</td>
                <td class="grayTD" style="width:15%;height:15px">处理意见</td>
                <td class="grayTD" style="width:20%;height:15px">附件</td>
              </tr>
              <tr v-if="submit.STATE == 'CUSTOMERAFFIRM' || submit.STATE == 'APPROVED' "
                v-for="(item, index) of processDetail" :key="index">
                <td colspan="1" rowspan="1" style="height:15px">
                  {{ submit.PRODUCTION_VERSION }}
                </td>
                <td colspan="1" rowspan="1" style="height:15px">
                  {{ submit.ITEM_NO }}
                </td>
                <td colspan="1" rowspan="1" style="height:15px">
                  {{ submit.UNIT }}
                </td>
                <td colspan="1" rowspan="1" style="height:15px">
                  {{ processDetail[index].P_QTY }}
                </td>
                <td colspan="1" rowspan="1" style="height:15px">
                  {{ processDetail[index].P_MONEY }}
                </td>
                <td colspan="1" rowspan="1" style="height:15px">
                  {{ processDetail[index].P_NOTES }}
                </td>
                <td colspan="1" rowspan="1" style="height:15px">
                  {{ processDetail[index].P_RESULT }}
                </td>
                <td colspan="1" rowspan="1" style="height:15px">
                  <ul class="el-upload-list el-upload-list--text" v-if="processDetail[index].fileListForProcess.length">
                    <li v-for="(file, index) in processDetail[index]
                        .fileListForProcess" :key="index" class="el-upload-list__item is-success" tabindex="0">
                      <a class="el-upload-list__item-name">
                        <el-link type="primary" size="mini" @click="showImage(file.url)"
                          @mouseenter.native="showMiniImage($event, file.url)" @mouseout.native="MiniPic = false">
                          {{ file.name }}
                        </el-link>
                      </a>
                      <label style="display:block;position:absolute;top:1px;right:10px;">
                        <a style="cursor:pointer;" @click="downLoad(file.url)">下载</a>
                      </label>
                    </li>
                  </ul>
                  <span v-else>无</span>
                </td>
              </tr>
              <tr v-if="
                  submit.STATE == 'CUSTOMERAFFIRM' || submit.STATE == 'APPROVED'
                ">
                <td class="grayTD" style="height:15px">金额小写</td>
                <td style="height:15px" colspan="3">{{ submit.TOTALMONEY }}</td>
                <td class="grayTD" style="height:15px">金额大写</td>
                <td style="height:15px" colspan="3">{{ totalMoneyUpper }}</td>
              </tr>

              <tr style="height:90px">
                <td colspan="8" border="0px" style="font-size:13px;color:gray;text-align:left;">
                  <div style="margin:4px 0px 4px 4px">
                    注意：1.若您未在我公司对您的《退货/赔偿电子申请书》提交处理意见之日起15日内确认、提出异议的，则视为放弃赔偿权利；<br />
                    2.玉兰公司支付的退货金额，仅限于本《退货/赔偿电子申请书》的金额，不承担其他费用；<br />
                    3.请您仔细阅读本《退货/赔偿电子申请书》相关信息，一旦确认，视为同意我公司的处理方案。<br />
                    公司名称：广东玉兰集团股份有限公司&emsp;
                    &emsp;&emsp;&emsp;地址：东莞市莞城莞龙路段狮龙路莞城科技园内<br />
                    电话:0769-23321708&emsp;&emsp;邮政编码:523119&emsp;&emsp;邮箱：yulan315@yulangroup.cn<br />
                  </div>
                </td>
              </tr>
              <tr style="height:40px">
                <td colspan="4" border="0px" style="font-size:13px;color:gray;text-align:center;">
                  <div style="margin:4px 0px 4px 4px" v-if="submit.STATE != 'SUBMITTED'&&submit.STATE != 'APPROVED'">
                    广东玉兰集团股份有限公司<br />
                    市场部<br />
                    {{ new Date(submit.DEAL_TS).getFullYear() }}年
                    {{
                      addZeroIfNeed(new Date(submit.DEAL_TS).getMonth() + 1)
                    }}月
                    {{ addZeroIfNeed(new Date(submit.DEAL_TS).getDate()) }}日
                  </div>
                  <div style="margin:4px 0px 4px 4px" v-if="submit.STATE == 'APPROVED'">
                    广东玉兰集团股份有限公司<br />
                    市场部<br />
                    {{ new Date(submit.REASSURE_TS).getFullYear() }}年
                    {{
                      addZeroIfNeed(new Date(submit.REASSURE_TS).getMonth() + 1)
                    }}月
                    {{ addZeroIfNeed(new Date(submit.REASSURE_TS).getDate()) }}日
                  </div>
                  <div style="margin:4px 0px 4px 4px" v-if="submit.STATE == 'SUBMITTED'">
                    广东玉兰集团股份有限公司<br />
                    市场部<br />
                    <span> 年 月 日</span>
                  </div>
                </td>
                <td colspan="4" border="0px" style="font-size:13px;color:gray;text-align:center;">
                  <div>
                    经销商
                    <span v-if="submit.STATE == 'APPROVED'">:{{ submit.CNAME }}</span><br />

                    <span v-if="submit.STATE != 'APPROVED'"> 年 月 日</span>
                    <span v-else>
                      {{ new Date(submit.REASSURE_TS).getFullYear() }}年
                      {{
                        addZeroIfNeed(
                          new Date(submit.REASSURE_TS).getMonth() + 1
                        )
                      }}月
                      {{
                        addZeroIfNeed(new Date(submit.REASSURE_TS).getDate())
                      }}日
                    </span>
                  </div>
                </td>
              </tr>
            </table>
          </div>
        </div>

        <!-- 编辑区 -->
        <div v-show="isEdit">
          <div>
            <table width="100%" border="0" cellspacing="0" cellpadding="0">
              <tr>
                <td style="font-size:20px;height:30px;text-align:center;" colspan="7">
                  退货/赔偿电子申请书【{{ submit.STATE | transStatus }}】
                </td>
              </tr>
            </table>
          </div>
          <div class="table-c" style="margin-top:5px;">
            <table width="100%" border="0" cellspacing="0" cellpadding="0">
              <tr>
                <td class="grayTD" style="height:15px" colspan="1">客户代码</td>
                <td style="height:15px" colspan="1">
                  {{ submit.CID }}
                </td>
                <td class="grayTD" style="height:15px" colspan="1">客户名称</td>
                <td style="height:15px" colspan="5">
                  {{ submit.CNAME }}
                </td>
              </tr>
              <tr>
                <td class="grayTD" style="height:15px">提货单号</td>
                <td style="height:15px">{{ submit.SALE_NO }}</td>
                <td class="grayTD" style="height:15px">B2B订单号</td>
                <td style="height:15px" colspan="2">{{ submit.ORDER_NO }}</td>
                <td class="grayTD" style="height:15px">ERP订单号</td>
                <td style="height:15px" colspan="2">
                  {{ submit.CONTRACT_NO }}
                </td>
              </tr>
              <tr>
                <td class="grayTD" style="height:15px">联系人</td>
                <td style="height:15px">{{ submit.CONTACT_MAN }}</td>
                <td class="grayTD" style="height:15px">联系电话</td>
                <td style="height:15px" colspan="2">
                  {{ submit.CONTACT_PHONE }}
                </td>
                <td class="grayTD" style="height:15px">物流单号</td>
                <td style="height:15px" colspan="2">{{ submit.TRANS_ID }}</td>
              </tr>
              <tr>
                <td class="grayTD" style="height:15px">问题描述</td>
                <td style="height:15px" colspan="7">{{ submit.NOTES }}</td>
              </tr>
              <tr>
                <td class="grayTD" colspan="1" style="height:15px">
                  产品/项目
                </td>
                <td class="grayTD" colspan="2" style="height:15px">型号</td>
                <td class="grayTD" colspan="1" style="height:15px">单位</td>
                <td class="grayTD" colspan="1" style="height:15px">数量</td>
                <td class="grayTD" colspan="3" style="height:15px">
                  上传相关信息
                </td>
              </tr>
              <tr>
                <td colspan="1" style="height:21px">
                  {{ submit.PRODUCTION_VERSION }}
                </td>
                <td colspan="2" style="height:21px">{{ submit.ITEM_NO }}</td>
                <td colspan="1" style="height:21px">{{ submit.UNIT }}</td>
                <td colspan="1" style="height:21px">{{ submit.QTY }}</td>
                <td colspan="3" style="height:21px">
                  <ul class="el-upload-list el-upload-list--text">
                    <li v-for="(file, index) in fileList" :key="index" class="el-upload-list__item is-success"
                      tabindex="0">
                      <a class="el-upload-list__item-name">
                        <el-link type="primary" size="mini" @click="showImage(file.url)"
                          @mouseenter.native="showMiniImage($event, file.url)" @mouseout.native="MiniPic = false">
                          {{ file.name }}
                        </el-link>
                      </a>
                      <label style="display:block;position:absolute;top:1px;right:10px;">
                        <a style="cursor:pointer;" @click="downLoad(file.url)">下载</a>
                      </label>
                    </li>
                  </ul>
                </td>
              </tr>
              <tr v-if="submit.STATE == 'SENDBACK'">
                <td class="grayTD" style="font-size:20px;height:30px" colspan="8">
                  玉兰处理意见
                </td>
              </tr>
              <tr v-if="submit.STATE == 'SENDBACK'">
                <td class="grayTD" style="height:15px" colspan="1">
                  初审意见或退回原因<span style="color:red;">*</span>
                </td>
                <td style="height:15px" colspan="7">
                  <el-input v-model="submit.FIRST_AUDITION" placeholder="请填写处理意见或退回原因" clearable class="inputStyle">
                  </el-input>
                </td>
              </tr>
              <tr v-if="submit.STATE != 'SENDBACK'">
                <td class="grayTD" style="font-size:20px;height:30px" colspan="8">
                  玉兰处理意见
                </td>
              </tr>
              <tr v-if="submit.STATE != 'SENDBACK'">
                <td class="grayTD" style="height:15px" colspan="1">初审意见</td>
                <td style="height:15px" colspan="2" v-if="
                    submit.STATE == 'SUBMITTED' || submit.STATE == 'RECEIVE'
                  ">
                  <el-select style="height:16px;width:100%;padding:0px 0px 0px 0px;" v-model="submit.RETURN_TYPE"
                    filterable placeholder="退货方式">
                    <el-option v-for="item in returnArray" :key="item.value" :label="item.label" :value="item.value">
                    </el-option>
                  </el-select>
                </td>
                <td style="height:15px" colspan="2" v-else>
                  {{ submit.RETURN_TYPE }}
                </td>
                <td style="height:15px" colspan="5" v-if="
                    submit.STATE == 'SUBMITTED' || submit.STATE == 'RECEIVE'
                  ">
                  <el-input v-model="submit.FIRST_AUDITION" placeholder="请填写处理意见或退回原因" clearable class="inputStyle">
                  </el-input>
                </td>
                <td style="height:15px" colspan="5" v-else>
                  {{ submit.FIRST_AUDITION }}
                </td>
              </tr>
              <tr v-if="
                  submit.STATE != 'SENDBACK' && submit.RETURN_TYPE != '无需退货'
                ">
                <td class="grayTD" style="height:15px">备注信息</td>
                <td style="height:15px" colspan="7" v-if="submit.RETURN_TYPE == '玉兰取货'">
                  我公司已安排物流公司上门取货，请保持电话畅通
                </td>
                <td style="height:15px" colspan="7" v-if="submit.RETURN_TYPE == '客户邮寄'">
                  请您在快递单上备注提货单号
                </td>
                <td style="height:15px" colspan="7" v-else></td>
              </tr>
              <tr v-if="
                  submit.STATE != 'SENDBACK' && submit.RETURN_TYPE == '客户邮寄'
                ">
                <td class="grayTD" style="height:15px">退货或寄样信息</td>
                <td style="height:15px" colspan="7" v-if="
                    submit.STATE == 'SUBMITTED' || submit.STATE == 'RECEIVE'
                  ">
                  <el-select style="width:99%;" v-model="submit.RETURN_ADDRESS" filterable placeholder="请选择地址和收件人">
                    <el-option v-for="item in returnInfo" :key="item.value" :label="item.label" :value="item.value">
                    </el-option>
                  </el-select>
                </td>
                <td style="height:15px" colspan="7" v-else>
                  {{ submit.RETURN_ADDRESS }}
                </td>
              </tr>
              <tr v-if="
                  submit.STATE != 'SENDBACK' && submit.RETURN_TYPE == '客户邮寄'
                ">
                <td class="grayTD" style="height:15px">邮寄备注信息</td>
                <td style="height:15px" colspan="7">
                  您的提货单号： {{ submit.SALE_NO }}
                </td>
              </tr>
              <tr v-if="
                  submit.STATE != 'SUBMITTED' &&
                    submit.STATE != 'SENDBACK' &&
                    submit.RETURN_TYPE == '客户邮寄'
                ">
                <td class="grayTD" style="height:15px">物流备注信息</td>
                <td style="height:15px;color:red;" colspan="7"
                  v-if="!submit.RETURN_TRANSINFO && submit.STATE == 'RECEIVE'">
                  {{ submit.RETURN_TRANSINFO | transInfoTip }}
                </td>
                <td style="height:15px;" colspan="7" v-if="!submit.RETURN_TRANSINFO && submit.STATE != 'RECEIVE'">
                  {{ submit.RETURN_TRANSINFO | transInfoTip }}
                </td>
                <td style="height:15px;" colspan="7" v-if="submit.RETURN_TRANSINFO !== ''">
                  {{ submit.RETURN_TRANSINFO }}
                </td>
              </tr>
              <!-- 初审意见附件上传 -->
              <!-- fileList是否需要改成fileListForAudition -->
              <tr v-if="submit.STATE == 'SUBMITTED'||submit.STATE == 'RECEIVE'">
                <td class="grayTD" style="height:15px" colspan="1">附件</td>
                <td style="height:15px" colspan="7">
                  <div>
                    <el-upload class="upload-de" action="#" drag multiple :on-change="function(file, fileList) {
                          return handleChange(file, fileList);
                        }
                      " :on-remove="function(file, fileList) {
                          return handleRemove(file, fileList);
                        }
                      " ref="upload" :http-request="uploadFiles" :auto-upload="false" :file-list="fileListForAudition">
                      <i class="el-icon-upload2" style="margin-top:5px;">
                        <span style="font-size:15px;">上传附件</span>
                      </i>
                    </el-upload>
                  </div>
                </td>
              </tr>
              <tr v-if="submit.STATE != 'SUBMITTED' && submit.STATE != 'RECEIVE'&&submit.STATE != 'SENDBACK'">
                <td class="grayTD" style="height:15px" colspan="1">附件</td>
                <td style="height:15px" colspan="7">
                  <ul class="el-upload-list el-upload-list--text">
                    <li v-for="(file, index) in fileListForAudition" :key="index"
                      class="el-upload-list__item is-success" tabindex="0">
                      <a class="el-upload-list__item-name">
                        <el-link type="primary" size="mini" @click="showImage(file.url)"
                          @mouseenter.native="showMiniImage($event, file.url)" @mouseout.native="MiniPic = false">
                          {{ file.name }}
                        </el-link>
                      </a>
                      <label style="display:block;position:absolute;top:1px;right:10px;">
                        <a style="cursor:pointer;" @click="downLoad(file.url)">下载</a>
                      </label>
                    </li>
                  </ul>
                </td>
              </tr>
              <tr v-if="submit.STATE != 'SUBMITTED' && submit.STATE != 'SENDBACK'">
                <td class="grayTD" style="font-size:20px;height:30px" colspan="8">
                  玉兰处理结果
                </td>
              </tr>
              <tr v-if="submit.STATE != 'SUBMITTED' && submit.STATE != 'SENDBACK'">
                <td class="grayTD" style="width:15%;height:15px">
                  <el-button type="primary" size="mini" icon="el-icon-plus" @click="_rowPlus()" circle
                    style="border-radius:50%;">
                  </el-button>
                  产品/项目
                </td>
                <td class="grayTD" style="width:13%;height:15px">型号</td>
                <td class="grayTD" style="width:8%;height:15px">单位</td>
                <td class="grayTD" style="width:8%;height:15px">
                  数量<span style="color:red;">*</span>
                </td>
                <td class="grayTD" style="width:8%;height:15px">
                  金额<span style="color:red;">*</span>
                </td>
                <td class="grayTD" style="width:13%;height:15px">
                  质量问题<span style="color:red;">*</span>
                </td>
                <td class="grayTD" style="width:15%;height:15px">
                  处理意见<span style="color:red;">*</span>
                </td>
                <td class="grayTD" style="width:20%;height:15px">附件</td>
              </tr>
              <tr v-if="submit.STATE != 'SUBMITTED' && submit.STATE != 'SENDBACK'"
                v-for="(item, index) of processDetail" :key="index">
                <td colspan="1" rowspan="1" style="height:15px">
                  <el-button type="danger" size="mini" icon="el-icon-minus" @click="_rowSubtract(index)"
                    v-if="index != 0" circle>
                  </el-button>
                  {{ submit.PRODUCTION_VERSION }}
                </td>
                <td colspan="1" rowspan="1" style="height:15px">
                  {{ submit.ITEM_NO }}
                </td>
                <td colspan="1" rowspan="1" style="height:15px">
                  {{ submit.UNIT }}
                </td>
                <td colspan="1" rowspan="1" style="height:15px">
                  <input v-model="processDetail[index].P_QTY" placeholder="" clearable class="inputStyle" oninput="value=value.replace(/[^\d.]/g,'')
                           .replace(/^\./g, '').replace(/\.{2,}/g, '.')
                           .replace('.', '$#$').replace(/\./g, '')
                           .replace('$#$', '.')
                           .slice(0,value.indexOf('.') === -1? value.length: value.indexOf('.') + 3)" />
                </td>
                <td colspan="1" rowspan="1" style="height:15px">
                  <input v-model="processDetail[index].P_MONEY" placeholder="" clearable class="inputStyle" oninput="value=value.replace(/[^\d.]/g,'')
                           .replace(/^\./g, '').replace(/\.{2,}/g, '.')
                           .replace('.', '$#$').replace(/\./g, '')
                           .replace('$#$', '.')
                           .slice(0,value.indexOf('.') === -1? value.length: value.indexOf('.') + 3)" />
                </td>
                <td colspan="1" rowspan="1" style="height:15px">
                  <input v-model="processDetail[index].P_NOTES" placeholder="" clearable class="inputStyle" />
                </td>
                <td colspan="1" rowspan="1" style="height:15px">
                  <el-select style="width:99%;" v-model="processDetail[index].P_RESULT" filterable placeholder="">
                    <el-option v-for="item in processArray" :key="item.value" :label="item.label" :value="item.value">
                    </el-option>
                  </el-select>
                </td>
                <!--注意ref，两处上传的ref应该不同-->
                <td colspan="1" rowspan="1" style="height:15px">
                  <div>
                    <el-upload class="upload-de2" :action="
                        Global.baseUrl +
                          '/RETURNCOMPENSATIONBILL/UploadFilesForProcesss'
                      " drag multiple :on-change="function(file, fileList) {
                          return handleChangeForProcess(file, fileList, index);
                        }
                      " :on-remove="function(file, fileList) {
                          return handleRemoveForProcess(file, fileList, index);
                        }
                      " :on-success="function(res, file, fileList) {
                          return handleSuccessForProcess(
                            res,
                            file,
                            fileList,
                            index
                          );
                        }
                      " ref="upload2" :auto-upload="false" :file-list="processDetail[index].fileListForProcess" :data="{
                        CID: CID,
                        dateStamp: dateStamp,
                        dateString: dateString,
                        fileNameList: fileNameListForProcess
                      }">
                      <i class="el-icon-upload2" style="margin-top:5px;">
                        <span style="font-size:15px;">上传附件</span>
                      </i>
                    </el-upload>
                  </div>
                </td>
              </tr>
              <tr style="height:90px">
                <td colspan="8" border="0px" style="font-size:13px;color:gray;text-align:left;">
                  <div style="margin:4px 0px 4px 4px">
                    注意：1.若您未在我公司对您的《退货/赔偿电子申请书》提交处理意见之日起15日内确认、提出异议的，则视为放弃赔偿权利；<br />
                    2.玉兰公司支付的退货金额，仅限于本《退货/赔偿电子申请书》的金额，不承担其他费用；<br />
                    3.请您仔细阅读本《退货/赔偿电子申请书》相关信息，一旦确认，视为同意我公司的处理方案。<br />
                    公司名称：广东玉兰集团股份有限公司&emsp;
                    &emsp;&emsp;&emsp;地址：东莞市莞城莞龙路段狮龙路莞城科技园内<br />
                    电话:0769-23321708&emsp;&emsp;邮政编码:523119&emsp;&emsp;邮箱：yulan315@yulangroup.cn<br />
                  </div>
                </td>
              </tr>
              <tr style="height:40px">
                <td colspan="4" border="0px" style="font-size:13px;color:gray;text-align:center;">
                  <div style="margin:4px 0px 4px 4px" v-if="submit.STATE != 'SUBMITTED'&&submit.STATE != 'APPROVED'">
                    广东玉兰集团股份有限公司<br />
                    市场部<br />
                    {{ new Date(submit.DEAL_TS).getFullYear() }}年
                    {{
                      addZeroIfNeed(new Date(submit.DEAL_TS).getMonth() + 1)
                    }}月
                    {{ addZeroIfNeed(new Date(submit.DEAL_TS).getDate()) }}日
                  </div>
                  <div style="margin:4px 0px 4px 4px" v-if="submit.STATE == 'SUBMITTED'">
                    广东玉兰集团股份有限公司<br />
                    市场部<br />
                    <span> 年 月 日</span>
                  </div>
                </td>
                <td colspan="4" border="0px" style="font-size:13px;color:gray;text-align:center;">
                  <div>
                    经销商
                    <span v-if="submit.STATE == 'APPROVED'">:{{ submit.CNAME }}</span><br />
                    <span v-if="submit.STATE != 'APPROVED'"> 年 月 日</span>
                    <span v-else>
                      {{ new Date(submit.REASSURE_TS).getFullYear() }}年
                      {{
                        addZeroIfNeed(
                          new Date(submit.REASSURE_TS).getMonth() + 1
                        )
                      }}月
                      {{
                        addZeroIfNeed(new Date(submit.REASSURE_TS).getDate())
                      }}日
                    </span>
                  </div>
                </td>
              </tr>
            </table>

            <div style="text-align:center;margin-top:5px" v-if="isEdit">
              <el-button type="primary" size="mini" v-if="submit.STATE == 'SENDBACK'"
                @click="_EditDetail(submit.STATE, 5)">保存退回意见</el-button>
              <el-button type="primary" size="mini" v-if="submit.STATE == 'SUBMITTED'"
                @click="_EditDetail(submit.STATE, 1)">保存初审意见</el-button>
              <el-button type="success" size="mini" v-if="submit.STATE == 'RECEIVE'"
                @click="_EditDetail(submit.STATE, 4)">修改初审意见</el-button>
              <el-button type="primary" size="mini" v-if="
                  submit.STATE == 'RECEIVE' || submit.STATE == 'CUSTOMERAFFIRM'
                " @click="_EditDetail(submit.STATE, 3)">保存处理结果</el-button>
              <el-button type="danger" size="mini" v-if="submit.STATE == 'SUBMITTED'"
                @click="_EditDetail(submit.STATE, 2)">退回修改</el-button>
              <el-button type="info" size="mini" @click="
                  isEdit = false;
                  RefundDetail = false;
                ">返回</el-button>
            </div>
          </div>
        </div>
      </el-dialog>
    </div>

    <div v-if="MiniPic" style="z-index:99999;position:fixed;" :style="{ left: picX, top: picY }">
      <img class="BIGimg2" :src="imgUrl" />
    </div>

    <el-dialog width="500px" title="预览" :visible.sync="BigPic">
      <div>
        <img class="BIGimg" :src="imgUrl" />
      </div>
    </el-dialog>
  </div>
</template>

<script>
import print from "print-js";
import Axios from "axios";
import Cookies from "js-cookie";
import { digitUppercase } from "@/common/js/money.js";
import {
  getAllRefund,
  deleteRefund,
  updataRefundStatus,
  updatePrinted,
} from "@/api/refund";
import { getReturnInfo2 } from "@/api/orderListASP";
import {
  GetAllCompensation,
  GetCompensationById,
  GetNoPrinted2,
  UpdateFirstAudition,
  UpdateProcess,
  UpdatePrintedById,
  NewUploadFiles,
} from "@/api/paymentASP";
import { downLoadFile } from "@/common/js/downLoadFile";
import { mapMutations } from "vuex";
import { mapState } from "vuex";
export default {
  name: "refundExamine",
  data() {
    return {
      iniAuditionFileNum: 0, //编辑时初始状态下初审意见文件的个数
      filesSubmit: [], //按实际上传到服务器中的存储客户意见的附件
      picX: "0",
      picY: "0",
      MiniPic: false,
      BigPic: false,
      imgUrl: "",
      tableData: [], //表格数据
      allNum: 0, //表格总共有几条数据
      currentPage: 1, //当前页数
      pageSize: 10, //每页最多显示数量
      submit: [],
      returnInfo: [],
      processDetail: [], //玉兰处理结果表明细
      fileList: [], //存储用户上传附件
      fileListForAudition: [], //存储初审意见附件
      complaintDetail: false,
      deleteIndex: [], //记录处理结果删除文件的行
      isAdd: false,
      isCheck: false,
      isEdit: false,
      RefundDetail: false,
      isRefundAdd: false,
      FormRight: true,
      dateStamp: "",
      fileChangeForAudition: false,
      fileChangeForProcess: [],
      SELECT_STATUS: null, //存储下拉框的值
      beginTime: "", //查询的开始时间
      finishTime: "", //查询的结束时间
      companyId: Cookies.get("customerMainId"),
      CID: Cookies.get("cid"),
      CNAME: Cookies.get("realName"),
      selectItemNo: "", //搜索栏产品型号
      selectCNAME: "", //搜索栏姓名
      selectDealor: "", //搜索栏处理人名
      zongshuliang: "",
      daifashuliang: "",
      kuaidi100: "",
      kuaididanhao: "",
      kind: "", //编辑的种类
      dateString: "",
      fileNumber: 0,
      fileNameList: [],
      fileNameListForProcess: [],
      deleteFileForAudition: [], //删除的初审意见附件
      deleteFileForProcess: [], //删除的处理结果附件
      firstAddAudition: false, //是否是第一次添加初审意见的附件
      doActionByupload: false,
      //单据状态
      statusArray: [
        { value: null, label: "全部状态" },
        { value: "NEEDPROCESSING", label: "待处理" },
        { value: "SUBMITTED", label: "已提交" },
        { value: "SENDBACK", label: "退回修改" },
        { value: "RECEIVE", label: "已接收" },
        { value: "CUSTOMERAFFIRM", label: "客户确认中" },
        { value: "APPROVED", label: "客户同意" },
      ],
      returnArray: [
        //退货方式
        {
          label: "玉兰取货",
          value: "玉兰取货",
        },
        {
          label: "客户邮寄",
          value: "客户邮寄",
        },
        {
          label: "无需退货",
          value: "无需退货",
        },
      ],
      processArray: [
        //退货方式
        {
          label: "赔偿",
          value: "赔偿",
        },
        {
          label: "退货",
          value: "退货",
        },
        {
          label: "无质量问题",
          value: "无质量问题",
        },
      ],
    };
  },
  props: ["orderNo", "itemNo", "lineNo"],
  filters: {
    datatrans(value) {
      if (value == "9999/12/31 00:00:00") return "";
      //时间戳转化大法
      let date = new Date(value);
      let y = date.getFullYear();
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
      return y + "-" + MM + "-" + d + " " + h + ":" + m; //+ ':' + s
    },
    //过滤掉值为空的属性
    propertyFilter(obj) {
      let keyArr = Object.keys(obj);
      for (let i = 0; i < keyArr.length; i++) {
        if (obj[keyArr[i]] === "") {
          delete obj[keyArr[i]];
        }
      }
      return obj;
    },
    transStatus(value) {
      switch (value) {
        case null:
          return "";
          break;
        case "SUBMITTED":
          return "已提交";
          break;
        case "SENDBACK":
          return "退回修改";
          break;
        case "RECEIVE":
          return "已接收";
          break;
        case "CUSTOMERAFFIRM":
          return "客户确认中";
          break;
        case "APPROVED":
          return "客户同意";
          break;
      }
    },
    //物流备注信息未填写的提示
    transInfoTip(val) {
      if (val == null || val == "") {
        return "客户尚未填写该内容";
      } else {
        return val;
      }
    },
  },
  methods: {
    DealManTrans(row) {
      if (row.STATE != "SUBMITTED") {
        return row.DEALMAN_NAME;
      } else {
        return "";
      }
    },
    //展开搜索
    clickSearch() {
      this.currentPage = 1;
      this.refresh();
    },
    //重置搜索条件
    resetSearch() {
      this.beginTime = "";
      this.finishTime = "";
      this.SELECT_STATUS = "";
      this.selectItemNo = "";
      this.selectCNAME = "";
      this.selectDealor = "";
    },
    //查询未打印的单据
    checkNoPrint() {
      GetNoPrinted2().then((res) => {
        this.tableData = res.data;
        this.tableData.forEach((item) => {
          item.PRINTED = item.PRINTED === "0" ? true : false;
        });
        this.allNum = res.count;
      });
    },
    //查询满足条件所有用户的退货赔偿
    refresh() {
      let obj = {
        CID: this.CID,
        page: this.currentPage, //第几页
        number: this.pageSize, //一页有多少数据
        startDate: this.beginTime, //开始日期
        endDate: this.finishTime, //结束日期
        state: this.SELECT_STATUS, //状态
        DEALMAN_NAME: this.selectDealor, //创建者名称
        cName: this.selectCNAME, //客户名称
        itemNo: this.selectItemNo, //产品号
      };
      if (!obj.startDate) {
        obj.startDate = "0001/1/1 00:00:00";
      }
      if (!obj.endDate) {
        obj.endDate = "9999/12/31";
      } else {
        obj.endDate = obj.endDate + " 23:59:59";
      }
      let filter = this.$options.filters["propertyFilter"];
      GetAllCompensation(filter(obj))
        .then((res) => {
          this.tableData = res.data;
          this.tableData.forEach((item) => {
            item.PRINTED = item.PRINTED === "0" ? true : false;
          });
          this.allNum = res.count;
        })
        .catch((err) => {
          this.tableData = [];
          this.allNum = 0;
        });
    },
    //查看详情
    _CheckDetail(val, type) {
      //初始化
      this.submit = [];
      this.fileList = [];
      this.fileListForAudition = [];
      this.filesSubmit = [];
      this.iniAuditionFileNum = 0;
      this.fileNumber = 0;
      this.fileNameList = [];
      this.fileNameListForProcess = [];
      this.deleteFileForAudition = [];
      this.deleteFileForProcess = [];
      this.processDetail = [];
      this.fileChangeForAudition = false;
      this.fileChangeForProcess = [];
      this.firstAddAudition = false;
      this.doActionByupload = false;
      this.dateStamp = new Date().getTime();
      let data = {
        ID: val.ID,
        STATE: val.STATE,
      };
      GetCompensationById(data).then((res) => {
        if (res.count > 0) {
          this.submit = res.data[0];
          if (this.submit.STATE == "SUBMITTED") {
            this.submit.FIRST_AUDITION = "";
          }
          if (
            this.submit.STATE == "CUSTOMERAFFIRM" ||
            this.submit.STATE == "APPROVED"
          ) {
            this.processDetail = res.data;
          }
        }
        //查询时，将对应用户附件的字段拆解开来，并作为对象传入文件集合中
        var list = this.submit.ATTACHMENT_FILE.split(";");
        for (var i = 0; i < list.length - 1; i++) {
          var index = list[i].lastIndexOf("/");
          var fileName = list[i].substr(index + 1);
          this.fileList.push({
            name: fileName,
            url: list[i],
          });
        }
        //查询时，将对应初审意见的附件的字段拆解开来，并作为对象传入文件集合中
        var list2 = this.submit.FIRST_AUDITION_FILE.split(";");
        for (var i = 0; i < list2.length - 1; i++) {
          var index = list2[i].lastIndexOf("/");
          var fileName = list2[i].substr(index + 1);
          this.fileListForAudition.push({
            name: fileName,
            url: list2[i],
          });
        }
        this.iniAuditionFileNum = this.fileListForAudition.length;
        //查询附件名称的末尾最大编号
        if (list2.length >= 2) {
          var findIndex = list2[list2.length - 2].lastIndexOf("-");
          this.fileNumber = parseInt(
            list2[list2.length - 2].substr(findIndex + 1, 1)
          );
          this.firstAddAudition = false;
        }
        //添加附件前是否已经存在附件
        if (list2.length == 1) {
          this.fileNumber = 0;
          this.firstAddAudition = true;
        }
        //查询时，将对应处理结果的附件的字段拆解开来，并作为对象传入文件集合中
        for (let j = 0; j < this.processDetail.length; j++) {
          //初始化
          this.processDetail[j].fileListForProcess = [];
          this.processDetail[j].deleteFileForProcess = [];
          this.processDetail[j].fileNameList = [];
          this.processDetail[j].uploadSuccess = false;
          this.processDetail[j].fileChangeForProcess = false;
          this.processDetail[j].firstAddProcess = false;
          this.deleteFileForProcess.push("");
          this.fileChangeForProcess.push("0");
          var list3 = this.processDetail[j].PROCESS_FILE.split(";");
          for (var i = 0; i < list3.length - 1; i++) {
            var index = list3[i].lastIndexOf("/");
            var fileName = list3[i].substr(index + 1);
            this.processDetail[j].fileListForProcess.push({
              name: fileName,
              url: list3[i],
            });
          }
          //查询附件名称的末尾最大编号
          if (list3.length >= 2) {
            var findIndex = list3[list3.length - 2].lastIndexOf("-");
            this.processDetail[j].fileNumber = parseInt(
              list3[list3.length - 2].substr(findIndex + 1, 1)
            );
          } else {
            this.processDetail[j].fileNumber = 0;
          }
        }
        if (type == 1) {
          this.isEdit = false;
          this.isCheck = true;
        } else {
          if (this.submit.STATE == "RECEIVE") {
            this.processDetail.push({
              P_RTCB_ID: this.submit.RTCB_ID,
              LINE_NO: "",
              P_QTY: "",
              P_NOTES: "",
              P_RESULT: "",
              P_MONEY: "",
              fileListForProcess: [],
              deleteFileForProcess: [],
              fileChangeForProcess: [],
              PROCESS_FILE: "",
              PROCESS_FILE_FOLDER: "",
              fileNumber: 0,
              fileNameList: [],
              uploadSuccess: false,
            });
            this.deleteFileForProcess.push("");
            this.fileChangeForProcess.push("0");
          }
          this.isEdit = true;
          this.isCheck = false;
        }
        this.RefundDetail = true;
      });
    },
    //保存修改
    _EditDetail(val, type) {
      this.kind = type;
      if (type == 3) {
        //编辑处理结果
        if (
          this.deleteFileForAudition.length != 0 ||
          this.fileChangeForAudition
        ) {
          this.$alert(
            "若要对初审处理意见的附件进行修改，请点击保存初审意见",
            "提示",
            {
              confirmButtonText: "确定",
              type: "warning",
            }
          );
          return;
        }
        var totalMoney = 0;
        //遍历处理结果明细
        for (var i = 0; i < this.processDetail.length; i++) {
          //判断是否填完所有信息
          if (
            !String(this.processDetail[i].P_QTY) ||
            !this.processDetail[i].P_NOTES ||
            !this.processDetail[i].P_RESULT ||
            !String(this.processDetail[i].P_MONEY)
          ) {
            this.$alert("请完善处理结果", "提示", {
              confirmButtonText: "确定",
              type: "warning",
            });
            return;
          }
          //判断是否需要上传附件
          if (this.processDetail[i].fileListForProcess.length != 0) {
            //判断上传附件的形式为图片或视频
            if (this.FormRight == false) {
              this.$alert("提交失败，附件仅能上传图片或视频", "提示", {
                confirmButtonText: "确定",
                type: "warning",
              });
              return;
            }
          } else {
          }
          if (this.processDetail[i].fileChangeForProcess) {
            //是否需要上传附件
            this.$refs.upload2[i].submit();
            this.processDetail[i].PROCESS_FILE = "";
            for (
              let j = 0;
              j < this.processDetail[i].fileListForProcess.length;
              j++
            ) {
              this.processDetail[i].PROCESS_FILE +=
                "/Files/RTCB_PROCESS/" +
                this.CID +
                "/" +
                this.dateStamp +
                "/" +
                this.processDetail[i].fileListForProcess[j].name +
                ";";
            }
            this.processDetail[i].PROCESS_FILE_FOLDER =
              "/Files/RTCB_PROCESS/" + this.CID + "/" + this.dateStamp;
          } else {
            //不需要的话是否需要删除文件
            if (this.processDetail[i].deleteFileForProcess.length > 0) {
              for (
                let j = 0;
                j < this.processDetail[i].deleteFileForProcess.length;
                j++
              ) {
                this.processDetail[this.deleteIndex[j]].PROCESS_FILE = "";
                for (
                  var k = 0;
                  k <
                  this.processDetail[this.deleteIndex[j]].fileListForProcess
                    .length;
                  k++
                ) {
                  this.processDetail[this.deleteIndex[j]].PROCESS_FILE +=
                    this.processDetail[this.deleteIndex[j]].fileListForProcess[
                      k
                    ].url + ";";
                }
              }
            }
          }
          totalMoney = totalMoney.add(this.processDetail[i].P_MONEY);
        }
        this.submit.TOTALMONEY = totalMoney;
        //之前没有经过handleChangeForProcess来执行下述代码
        if (this.doActionByupload != true) {
          this.submitEDITANSYCCForProcess();
        }
      } else {
        //编辑初审意见
        //先判断填写的信息是否完整
        if (type == 2 || type == 5) {
          if (!this.submit.FIRST_AUDITION) {
            this.$alert("请填写初审意见或退回原因", "提示", {
              confirmButtonText: "确定",
              type: "warning",
            });
            return;
          }
          this.submitAudition(type);
        } else if (type == 1 || type == 4) {
          //判断信息是否填写完整
          if (!this.submit.FIRST_AUDITION) {
            this.$alert("请填写初审意见或退回原因", "提示", {
              confirmButtonText: "确定",
              type: "warning",
            });
            return;
          }
          if (!this.submit.RETURN_TYPE) {
            this.$alert("请选择退货方式", "提示", {
              confirmButtonText: "确定",
              type: "warning",
            });
            return;
          } else {
            if (
              this.submit.RETURN_TYPE == "客户邮寄" &&
              !this.submit.RETURN_ADDRESS
            ) {
              this.$alert("请选择地址和收件人", "提示", {
                confirmButtonText: "确定",
                type: "warning",
              });
              return;
            }
          }
          //判断上传附件的形式为图片或视频
          if (this.fileListForAudition.length != 0 && this.FormRight == false) {
            this.$alert("提交失败，附件仅能上传图片或视频", "提示", {
              confirmButtonText: "确定",
              type: "warning",
            });
            return;
          }
          //第一次添加
          if (this.firstAddAudition && this.fileChangeForAudition) {
            this.$refs.upload.submit();
          } else if (!this.firstAddAudition && this.fileChangeForAudition) {
            //修改
            this.$refs.upload.submit();
          } else {
            if (this.deleteFileForAudition.length > 0) {
              for (let i = 0; i < this.deleteFileForAudition.length; i++) {
                this.submit.FIRST_AUDITION_FILE = "";
                for (var j = 0; j < this.fileListForAudition.length; j++) {
                  this.submit.FIRST_AUDITION_FILE +=
                    this.fileListForAudition[j].url + ";";
                }
              }
            }
            this.submitAudition(this.kind);
          }
        }
      }
    },
    //显示图片
    showImage(url) {
      var list1 = url.split("png");
      var list2 = url.split("jpg");
      var list3 = url.split("jpeg");
      var list4 = url.split("bmp");
      if (
        list1.length > 1 ||
        list2.length > 1 ||
        list3.length > 1 ||
        list4.length > 1
      ) {
        this.imgUrl = "";
        //url只是部分路径，还需要一个头部（还需要全路径）
        this.imgUrl = this.Global.baseUrl + url;
        this.BigPic = true;
      } else {
        return;
      }
    },
    //图片预览
    showMiniImage(event, url) {
      var list1 = url.split("png");
      var list2 = url.split("jpg");
      var list3 = url.split("jpeg");
      var list4 = url.split("bmp");
      if (
        list1.length > 1 ||
        list2.length > 1 ||
        list3.length > 1 ||
        list4.length > 1
      ) {
        this.imgUrl = this.Global.baseUrl + url;
        var clientWidth = document.body.clientWidth;
        var clientHeight = document.body.clientHeight;
        var curserX = event.x;
        var curserY = event.y;
        if (curserX + 200 + 20 < clientWidth) {
          this.picX = curserX + 20 + "px";
        } else {
          this.picX = curserX - 200 - 20 + "px";
        }
        if (curserY + 200 + 10 < clientHeight) {
          this.picY = curserY + 10 + "px";
        } else {
          this.picY = curserY - 200 - 10 + "px";
        }
        this.MiniPic = true;
      } else {
        return;
      }
    },
    //下载
    downLoad(path) {
      downLoadFile(
        this.Global.baseUrl + `DownLoadAPI/DownloadFile?path=${path}&`
      );
    },
    //切换下一页
    handleCurrentChange(val) {
      this.currentPage = val;
      this.refresh();
    },
    //隔行变色
    tableRowClassName({ row, rowIndex }) {
      if (rowIndex % 2 == 0) {
        return "success-row";
      }
      return "";
    },
    //添加兰居处理结果中的明细数目
    _rowPlus() {
      if (this.processDetail.length >= this.submit.QTY) {
        this.$alert("已经达到编辑项的上限", "提示", {
          confirmButtonText: "确定",
          type: "warning",
        });
        return;
      } else {
        this.processDetail.push({
          P_RTCB_ID: this.submit.RTCB_ID,
          LINE_NO: "",
          P_QTY: "",
          P_NOTES: "",
          P_RESULT: "",
          P_MONEY: "",
          fileListForProcess: [],
          deleteFileForProcess: [],
          fileChangeForProcess: [],
          PROCESS_FILE: "",
          PROCESS_FILE_FOLDER: "",
          fileNumber: 0,
          fileNameList: [],
          uploadSuccess: false,
        });
        this.deleteFileForProcess.push("");
        this.fileChangeForProcess.push("0");
        this.fileNameListForProcess.push();
      }
    },
    //减少兰居处理结果中的明细数目
    _rowSubtract(index) {
      if (this.processDetail.length == 1) {
        this.$alert("必须至少有一项该类信息", "提示", {
          confirmButtonText: "确定",
          type: "warning",
        });
        return;
      } else {
        this.processDetail.splice(index, 1);
        this.deleteFileForProcess.splice(index, 1);
        this.fileChangeForProcess.splice(index, 1);
        this.fileNameListForProcess.splice(index, 1);
      }
    },
    //获得退货或寄样信息
    _getReturnInfo() {
      getReturnInfo2().then((res) => {
        if (res.code == 0) {
          for (var i = 0; i < res.data.length; i++) {
            //这一部分应该在编辑里使用（可以进行初审的时候使用）
            this.returnInfo[i] = new Object();
            this.returnInfo[i].label =
              "地址:" +
              res.data[i].ADDRESS +
              "   收件人:" +
              res.data[i].ADDRESSEE +
              "   电话:" +
              res.data[i].TEL;
            this.returnInfo[i].value = this.returnInfo[i].label;
          }
        }
      });
    },
    //给时间加前缀'0'
    addZeroIfNeed(num) {
      if (num < 10) {
        return "0" + num;
      }
      return num;
    },
    //修改打印标记
    changePrinted(value, index) {
      //updatePrinted({
      UpdatePrintedById({
        id: value.ID,
        printed: value.PRINTED ? "0" : "1",
      });
    },
    //执行打印操作
    printRefund() {
      printJS({
        printable: "printTable",
        type: "html",
        maxWidth: 1300,
        headerStyle: "margin: -2px;",
        targetStyles: ["*"],
      });
    },
    handleChange(file, fileList) {
      var point = file.name.lastIndexOf(".");
      var suffix = file.name.substr(point);
      var list1 = suffix.split("png");
      var list2 = suffix.split("jpg");
      var list3 = suffix.split("jpeg");
      var list4 = suffix.split("bmp");
      var list5 = suffix.split("avi");
      var list6 = suffix.split("rmvb");
      var list7 = suffix.split("mp4");
      var list8 = suffix.split("flv");
      var list9 = suffix.split("rm");
      var list10 = suffix.split("mpg");
      var list11 = suffix.split("doc");
      var list12 = suffix.split("docx");
      var list13 = suffix.split("xls");
      var list14 = suffix.split("xlsx");
      var list15 = suffix.split("pdf");
      if (
        list1.length > 1 ||
        list2.length > 1 ||
        list3.length > 1 ||
        list4.length > 1 ||
        list5.length > 1 ||
        list6.length > 1 ||
        list7.length > 1 ||
        list8.length > 1 ||
        list9.length > 1 ||
        list10.length > 1 ||
        list11.length > 1 ||
        list12.length > 1 ||
        list13.length > 1 ||
        list14.length > 1 ||
        list15.length > 1
      ) {
        this.FormRight = true;
        this.fileListForAudition = fileList;
        this.fileChangeForAudition = true;
      } else {
        this.FormRight = false;
        this.fileListForAudition = [];
        this.$alert("请上传图片、视频或文档，否则无法成功提交", "提示", {
          confirmButtonText: "确定",
          type: "warning",
        });
        return;
      }
    },
    handleRemove(file, fileList) {
      this.fileListForAudition = fileList;
      if ((file.status = "success")) {
        this.deleteFileForAudition.push(file.url);
        this.fileNameList.splice(this.fileNameList.length - 1, 1);
      }
    },
    handleError(err, file, fileList) {
      this.$refs.upload.clearFiles();
      this.fileListForAudition = [];
      this.dateStamp = new Date().getTime();
      this.$alert("文件上传失败", "提示", {
        confirmButtonText: "确定",
        type: "success",
      });
    },
    //新增或修改初审意见的字段拼接
    submitAuditionFile(type) {
      //修改初审意见上传文件时，把文件列表中剩下的添加到filesSubmit中
      if (!this.firstAddAudition && this.fileChangeForAudition) {
        for (let i = 0; i < this.filesSubmit.length; i++) {
          for (let j = 0; j < this.fileListForAudition.length; j++) {
            if (
              this.fileListForAudition[j].name == this.filesSubmit[i].origin
            ) {
              //问题：返回的是后台修改的
              this.fileListForAudition.splice(j, 1); //去除文件列表中和上传文件相同的文件
            }
          }
        }
        for (let j = 0; j < this.fileListForAudition.length; j++) {
          //剩下的文件的字段并没有改变（因为没有上传，只是转移）
          var point = this.fileListForAudition[j].name.lastIndexOf(".");
          var suffix = this.fileListForAudition[j].name.substr(point);
          var finalFileName = this.filesSubmit[this.filesSubmit.length - 1].now;
          var num = this.filesSubmit.length + 1; //可能后台转移的顺序不一定和我这里重编号的顺序一样
          point = finalFileName.lastIndexOf("-");
          var prefix = finalFileName.substr(0, point + 1);
          var name = prefix + num + suffix;
          var model = {
            origin: this.fileListForAudition[j].name,
            now: name,
          };
          this.filesSubmit.push(model);
        }
      }
      //附件拼接
      this.submit.FIRST_AUDITION_FILE = "";
      for (let j = 0; j < this.filesSubmit.length; j++) {
        this.submit.FIRST_AUDITION_FILE +=
          "/Files/RETURNCOMPENSATIONBILL/" +
          this.companyId +
          "/" +
          this.dateStamp +
          "/" +
          this.filesSubmit[j].now +
          ";";
      }
      this.submit.FIRST_AUDITION_FILE_FOLDER =
        "/Files/RETURNCOMPENSATIONBILL/" +
        this.companyId +
        "/" +
        this.dateStamp;
      this.submitAudition(type);
    },
    //提交初审意见（最终）
    submitAudition(type) {
      if (type == 2 || type == 5) {
        if (type == 2) {
          this.submit.STATE = "SENDBACK";
        }
        this.submit.DEALMAN_CODE = this.CID;
        UpdateFirstAudition({
          head: this.submit,
          type: type,
          attchmentChange: this.fileChangeForAudition,
          deleteFile: this.deleteFileForAudition,
          firstAddFile: this.firstAddAudition,
        }).then((res) => {
          if (res.code == 0) {
            if (type == 2) {
              this.$alert("退回成功", "提示", {
                confirmButtonText: "确定",
                type: "success",
              });
            } else if (type == 5) {
              this.$alert("成功修改退回意见", "提示", {
                confirmButtonText: "确定",
                type: "success",
              });
            }
            this.releaseBadge("newRefund2"); //刷新角标
            this.refresh();
            this.RefundDetail = false;
            return;
          } else {
            this.$alert("退回失败，请稍后重试", "提示", {
              confirmButtonText: "确定",
              type: "warning",
            });
            return;
          }
        });
      } else if (type == 1 || type == 4) {
        if (type == 1) {
          this.submit.STATE = "RECEIVE";
        }
        this.submit.DEALMAN_CODE = this.CID;
        UpdateFirstAudition({
          head: this.submit,
          type: type,
          attchmentChange: this.fileChangeForAudition,
          deleteFile: this.deleteFileForAudition,
          firstAddFile: this.firstAddAudition,
        }).then((res) => {
          if (res.code == 0) {
            if (type == 1) {
              this.$alert("成功提交初审意见", "提示", {
                confirmButtonText: "确定",
                type: "success",
              });
            } else if (type == 4) {
              this.$alert("成功修改初审意见", "提示", {
                confirmButtonText: "确定",
                type: "success",
              });
            }
            this.releaseBadge("newRefund2"); //刷新角标
            this.refresh();
            this.RefundDetail = false;
            return;
          } else {
            this.$alert("提交失败，请稍后重试", "提示", {
              confirmButtonText: "确定",
              type: "warning",
            });
            return;
          }
        });
      }
    },
    handleChangeForProcess(file, fileList, index) {
      var point = file.name.lastIndexOf(".");
      var suffix = file.name.substr(point);
      var list1 = suffix.split("png");
      var list2 = suffix.split("jpg");
      var list3 = suffix.split("jpeg");
      var list4 = suffix.split("bmp");
      var list5 = suffix.split("avi");
      var list6 = suffix.split("rmvb");
      var list7 = suffix.split("mp4");
      var list8 = suffix.split("flv");
      var list9 = suffix.split("rm");
      var list10 = suffix.split("mpg"); //判断文件格式
      var list11 = suffix.split("doc");
      var list12 = suffix.split("docx");
      var list13 = suffix.split("xls");
      var list14 = suffix.split("xlsx");
      var list15 = suffix.split("pdf");
      if (
        list1.length > 1 ||
        list2.length > 1 ||
        list3.length > 1 ||
        list4.length > 1 ||
        list5.length > 1 ||
        list6.length > 1 ||
        list7.length > 1 ||
        list8.length > 1 ||
        list9.length > 1 ||
        list10.length > 1 ||
        list11.length > 1 ||
        list12.length > 1 ||
        list13.length > 1 ||
        list14.length > 1 ||
        list15.length > 1
      ) {
        this.doActionByupload = true;
        if (this.processDetail[index].uploadSuccess) {
        } else {
          //给文件名进行编码
          var line_no = index + 1;
          var number = this.processDetail[index].fileNumber + 1;
          this.processDetail[index].fileNumber =
            this.processDetail[index].fileNumber + 1;
          var prefix =
            this.CID + "-line" + line_no + "-" + this.dateString + "-" + number;
          var fileName = prefix + suffix;
          file.name = fileName;
          this.processDetail[index].fileNameList.push(fileName);
          this.fileNameListForProcess.push(fileName);
          if (
            this.fileChangeForProcess[index] != "" ||
            this.fileChangeForProcess[index] != null
          ) {
            //判断某条处理结果明细是否有文件新增
            this.fileChangeForProcess[index] =
              this.fileChangeForProcess[index] + ",1";
          } else {
            this.fileChangeForProcess[index] = "1";
          }
        }
        this.FormRight = true;
        this.processDetail[index].fileListForProcess = fileList;
        this.processDetail[index].fileChangeForProcess = true;
      } else {
        this.FormRight = false;
        this.processDetail[index].fileListForProcess = [];
        if (
          this.fileChangeForProcess[index] != "" ||
          this.fileChangeForProcess[index] != null
        ) {
          this.fileChangeForProcess[index] =
            this.fileChangeForProcess[index] + ",0";
        } else {
          this.fileChangeForProcess[index] = "0";
        }
        this.$alert("请上传图片、视频或文档，否则无法成功提交", "提示", {
          confirmButtonText: "确定",
          type: "warning",
        });
        return;
      }
    },
    handleRemoveForProcess(file, fileList, index) {
      this.processDetail[index].fileNameList.splice(index, 1);
      this.fileNameListForProcess.splice(index, 1);
      this.processDetail[index].fileListForProcess = fileList;
      if ((file.status = "success")) {
        this.processDetail[index].deleteFileForProcess.push(file.url);
        if (
          this.deleteFileForProcess[index] != "" ||
          this.deleteFileForProcess[index] != null
        ) {
          this.deleteFileForProcess[index] =
            this.deleteFileForProcess[index] + "," + file.url;
        } else {
          this.deleteFileForProcess[index] = file.url;
        }
        this.deleteIndex.push(index);
      }
    },
    handleSuccessForProcess(res, file, fileList, index) {
      this.processDetail[index].fileListForProcess = fileList;
      this.processDetail[index].uploadSuccess = true;
      var flag = true;
      for (let i = 0; i < this.processDetail.length; i++) {
        //判断是否所有上传附件的处理结果明细都已成功上传 ，若是，则赋值
        if (
          this.processDetail[i].fileListForProcess.length != 0 &&
          this.processDetail[i].fileListForProcess.filter(
            (item) => item.status == "success"
          ).length == this.processDetail[i].fileListForProcess.length
        ) {
        } else {
          flag = false;
          break;
        }
      }
      if (flag) {
        this.submitEDITANSYCCForProcess();
      }
    },
    submitEDITANSYCCForProcess() {
      this.submit.DEALMAN_CODE = this.CID;
      UpdateProcess({
        head: this.submit,
        details: this.processDetail,
        totalMoney: this.submit.TOTALMONEY,
        attchmentChange: this.fileChangeForProcess,
        deleteFiles: this.deleteFileForProcess,
      }).then((res) => {
        if (res.code == 0) {
          this.$alert("处理成功", "提示", {
            confirmButtonText: "确定",
            type: "success",
          });
          this.releaseBadge("newRefund2"); //刷新角标
          this.refresh();
          this.RefundDetail = false;
          return;
        } else {
          this.$alert("处理失败，请稍后重试", "提示", {
            confirmButtonText: "确定",
            type: "warning",
          });
          return;
        }
      });
    },
    //获取当前年月日
    GetNowDate() {
      var date = new Date();
      var year = date.getFullYear();
      var month = (date.getMonth() + 1).toString();
      var day = date.getDate().toString();
      if (month.length == 1) {
        month = "0" + month;
      }
      if (day.length == 1) {
        day = "0" + day;
      }
      var dateTime = year + "-" + month + "-" + day;
      this.dateString = dateTime;
    },
    //批量且重命名上传文档
    uploadFiles(param) {
      const formData = new FormData();
      formData.append("file", param.file);
      NewUploadFiles(formData, {
        params: {
          CID: this.companyId,
          dateStamp: this.dateStamp,
          dateString: this.dateString,
          type: "audition",
        },
      })
        .then((res) => {
          if (res.code == 0) {
            var model = {
              origin: param.file.name,
              now: res.data,
            };
            this.filesSubmit.push(model);
            //上传成功的文件数=上传的文件数
            if (
              this.filesSubmit.length ==
              this.fileListForAudition.length -
                this.iniAuditionFileNum +
                this.deleteFileForAudition.length
            ) {
              this.submitAuditionFile(this.kind);
            }
          }
        })
        .then(() => {})
        .catch(() => {});
    },
    ...mapMutations("badge", ["addBadge", "releaseBadge"]),
  },
  computed: {
    //返回大写形式的总金额
    totalMoneyUpper: function () {
      return digitUppercase(this.submit.TOTALMONEY);
    },
  },
  created() {
    this._getReturnInfo();
    this.GetNowDate();
    this.refresh();
  },
  activated: function () {
    this.refresh();
  },
};
</script>

<style scoped>
.table-c table {
  border-right: 1px solid black;
  border-bottom: 1px solid black;
}
.table-c table td {
  border-left: 1px solid black;
  border-top: 1px solid black;
  height: 22px;
  text-align: center;
  font-size: 16px;
}
.tableCol {
  background: #f0f9eb;
}
.grayTD {
  background: rgb(241, 242, 243);
}
.inputStyle {
  border: 0;
  height: 90%;
  width: 100%;
  font-size: 16px;
  text-align: center;
}
.centerCard {
  margin: 0 auto;
  position: relative;
}
.headSpan {
  font-weight: bold;
  font-size: 18px;
  color: black;
}
.zoomRight {
  font-weight: 400;
  font-size: 15px;
  line-height: 30px;
}
.zoomLeft {
  font-size: 15px;
  font-weight: bold;
  display: inline-block;
  margin-right: 30px;
}
</style>
<style>
.el-table .success-row {
  background: #f0f9eb;
}

.table-c .el-input__inner {
  height: 20px;
  width: 100%;
  font-size: 16px;
  box-shadow: none;
  text-align: center;
}

.table-c .el-input__inner:hover {
  border-color: #e9e9e9;
}

.table-c .el-input__inner:focus {
  border-color: #42a5f5;
  box-shadow: none;
  transition-duration: 0.5s;
}

.table-c .el-input__inner::-webkit-input-placeholder {
  line-height: 20px;
}

.table-c .el-input__inner,
.el-checkbox__inner,
.el-textarea__inner {
  border-radius: 0 !important;
}
.table-c .el-input__icon {
  height: 100%;
  width: 22px;
  text-align: center;
  line-height: 22px;
}
.table-c .el-textarea__inner {
  height: 48px;
  display: block;
  resize: vertical;
  padding: 1px 1px;
  -webkit-box-sizing: border-box;
  box-sizing: border-box;
  width: 100%;
  font-size: inherit;
  background-image: none;
  border: 1px solid #dcdfe6;
  border-top-color: rgb(220, 223, 230);
  border-right-color: rgb(220, 223, 230);
  border-bottom-color: rgb(220, 223, 230);
  border-left-color: rgb(220, 223, 230);
  border-radius: 4px;
  -webkit-transition: border-color 0.2s cubic-bezier(0.645, 0.045, 0.355, 1);
  transition: border-color 0.2s cubic-bezier(0.645, 0.045, 0.355, 1);
}
.table-c .el-upload-list__item {
  margin-top: 0px;
  line-height: 22px;
}
.tbarStyle {
  margin-bottom: 13px;
}
.BIGimg {
  width: 450px;
  height: 450px;
}
.BIGimg2 {
  width: 200px;
  height: 200px;
}
.icon-print {
  font-size: 25px;
  color: gray;
}
.upload-de .el-upload-dragger {
  height: 25px;
  width: 400px;
}
.upload-de2 .el-upload-dragger {
  height: 25px;
  width: 200px;
}
</style>