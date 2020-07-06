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
          <el-button type="primary" @click.native="GetSaleNoAndItemNo()" style="margin-right:6px;width:168px">旧系统提单售后
          </el-button>
        </div>
        <el-table border :row-class-name="tableRowClassName" :data="tableData" style="width: 100%">
          <el-table-column width="145" label="编号" prop="ID" align="center">
          </el-table-column>
          <el-table-column width="145" label="创建时间" align="center">
            <template slot-scope="scope">
              {{ scope.row.CREATE_TS | datatrans }}
            </template>
          </el-table-column>
          <el-table-column label="客户名称" prop="CNAME" align="center">
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
          <el-table-column width="150" label="操作" align="center">
            <template slot-scope="scope">
              <el-tooltip content="查看" placement="top">
                <el-button circle style="padding: 7px;" type="warning" icon="el-icon-search" size="mini"
                  @click="_CheckDetail(scope.row, 1)">
                </el-button>
              </el-tooltip>
              <el-tooltip v-if="
                  scope.row.STATE == 'SUBMITTED' ||
                    scope.row.STATE == 'SENDBACK'
                " content="删除" placement="top">
                <el-button circle style="padding: 7px;" @click="_Delete(scope.row.ID)" type="danger"
                  icon="el-icon-close" size="mini">
                </el-button>
              </el-tooltip>
              <el-tooltip v-if="
                  scope.row.STATE == 'CUSTOMERAFFIRM' ||
                    scope.row.STATE == 'SENDBACK' ||
                    (scope.row.STATE == 'RECEIVE' &&
                      scope.row.RETURN_TYPE == '客户邮寄')
                " content="编辑" placement="top">
                <el-button circle style="padding: 7px;" @click="_CheckDetail(scope.row, 2)" type="primary"
                  icon="el-icon-edit" size="mini">
                </el-button>
              </el-tooltip>
            </template>
          </el-table-column>
        </el-table>
        <el-pagination style="width: 100%;" class="dib tc" @current-change="handleCurrentChange"
          :current-page.sync="currentPage" :page-size="pageSize" layout="total, prev, pager, next, jumper"
          :total="allNum">
        </el-pagination>
      </div>
    </el-card>

    <el-dialog :visible.sync="RefundDetail" :close-on-click-modal="false" width="55%" append-to-body>
      <!-- 查看区 -->
      <div v-show="isCheck" id="printTable">
        <div style="margin-bottom:5px;">
          <table width="100%" border="0" cellspacing="0" cellpadding="0">
            <tr>
              <td style="font-size:20px;height:30px;text-align:center;" colspan="7">
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
              <td style="height:15px" colspan="2">{{ submit.CONTRACT_NO }}</td>
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
              <td class="grayTD" colspan="1" style="height:15px">产品/项目</td>
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
                  <li v-for="(file, index) in files" :key="index" class="el-upload-list__item is-success" tabindex="0">
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
            <tr v-if="submit.STATE != 'SUBMITTED'">
              <td class="grayTD" style="font-size:20px;height:30px" colspan="8">
                玉兰处理意见
              </td>
            </tr>
            <tr v-if="submit.STATE != 'SUBMITTED' && submit.STATE != 'SENDBACK'">
              <td class="grayTD" style="height:15px" colspan="1">初审意见</td>
              <td style="height:15px" colspan="2">{{ submit.RETURN_TYPE }}</td>
              <td style="height:15px" colspan="5">
                {{ submit.FIRST_AUDITION }}
              </td>
            </tr>
            <tr v-if="submit.STATE == 'SENDBACK'">
              <td class="grayTD" style="height:15px" colspan="1">
                初审意见及退回原因
              </td>
              <td style="height:15px" colspan="7">
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
                (submit.STATE == 'APPROVED' ||
                  submit.STATE == 'CUSTOMERAFFIRM' ||
                  submit.STATE == 'RECEIVE') &&
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
            <tr v-if="submit.STATE != 'SUBMITTED'">
              <td class="grayTD" style="height:15px" colspan="1">附件</td>
              <td style="height:15px" colspan="7">
                <ul class="el-upload-list el-upload-list--text">
                  <li v-for="(file, index) in fileListForAudition" :key="index" class="el-upload-list__item is-success"
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
            <tr v-if="
                submit.STATE == 'CUSTOMERAFFIRM' || submit.STATE == 'APPROVED'
              " v-for="(item, index) of processDetail" :key="index">
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
              <td style="font-size:20px;height:30px;text-align:center;" colspan="8">
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
              <td class="grayTD" style="height:15px;">提货单号</td>
              <td style="height:15px;">{{ submit.SALE_NO }}</td>
              <td class="grayTD" style="height:15px;">B2B订单号</td>
              <td style="height:15px;" colspan="2" v-if="submit.STATE != 'SENDBACK'">
                {{ submit.ORDER_NO }}
              </td>
              <td style="height:15px;" colspan="2" v-else>
                <el-input v-model="submit.ORDER_NO" placeholder="请填写" clearable class="inputStyle">
                </el-input>
              </td>
              <td class="grayTD" style="height:15px;">ERP订单号</td>
              <td style="height:15px;" colspan="2">{{ submit.CONTRACT_NO }}</td>
            </tr>
            <tr>
              <td class="grayTD" style="height:15px">
                联系人<span style="color:red;">*</span>
              </td>
              <td style="height:15px" v-if="submit.STATE != 'SENDBACK'">
                {{ submit.CONTACT_MAN }}
              </td>
              <td style="height:15px" v-else>
                <el-input v-model="submit.CONTACT_MAN" placeholder="请填写" clearable class="inputStyle">
                </el-input>
              </td>
              <td class="grayTD" style="height:15px">
                联系电话<span style="color:red;">*</span>
              </td>
              <td style="height:15px" colspan="2" v-if="submit.STATE != 'SENDBACK'">
                {{ submit.CONTACT_PHONE }}
              </td>
              <td style="height:15px" colspan="2" v-else>
                <el-input v-model="submit.CONTACT_PHONE" placeholder="请填写联系电话" clearable class="inputStyle"
                  oninput="value=value.replace(/[^\d]/g,'')">
                </el-input>
              </td>
              <td class="grayTD" style="height:15px">物流单号</td>
              <td style="height:15px" colspan="2" v-if="submit.STATE != 'SENDBACK'">
                {{ submit.TRANS_ID }}
              </td>
              <td style="height:15px" colspan="2" v-else>
                <el-input v-model="submit.TRANS_ID" placeholder="请填写" clearable class="inputStyle">
                </el-input>
              </td>
              <td style="height:15px"></td>
            </tr>
            <tr>
              <td class="grayTD" style="height:15px">
                问题描述<span style="color:red;">*</span>
              </td>
              <td style="height:15px" colspan="7" v-if="submit.STATE != 'SENDBACK'">
                {{ submit.NOTES }}
              </td>
              <td style="height:15px" colspan="7" v-else>
                <el-input v-model="submit.NOTES" placeholder="请填写问题描述" clearable class="inputStyle">
                </el-input>
              </td>
            </tr>
            <tr>
              <td class="grayTD" colspan="1" style="height:15px;">产品/项目</td>
              <td class="grayTD" colspan="2" style="height:15px;">型号</td>
              <td class="grayTD" colspan="1" style="height:15px;">单位</td>
              <td class="grayTD" colspan="1" style="height:15px;">
                数量<span style="color:red;">*</span>
              </td>
              <td class="grayTD" colspan="3" style="height:15px;">
                上传相关信息<span style="color:red;">*</span>
              </td>
            </tr>
            <tr>
              <td colspan="1" style="height:21px">
                {{ submit.PRODUCTION_VERSION }}
              </td>
              <td colspan="2" style="height:21px">{{ submit.ITEM_NO }}</td>
              <td colspan="1" style="height:21px">{{ submit.UNIT }}</td>
              <td colspan="1" style="height:21px" v-if="submit.STATE != 'SENDBACK'">
                {{ submit.QTY }}
              </td>
              <td colspan="1" style="height:21px" v-else>
                <input v-model="submit.QTY" placeholder="必填" clearable class="inputStyle" oninput="value=value.replace(/[^\d.]/g,'')
                           .replace(/^\./g, '').replace(/\.{2,}/g, '.')
                           .replace('.', '$#$').replace(/\./g, '')
                           .replace('$#$', '.')
                           .slice(0,value.indexOf('.') === -1? value.length: value.indexOf('.') + 3)" />
              </td>
              <td colspan="3" style="height:21px" v-if="submit.STATE != 'SENDBACK'">
                <ul class="el-upload-list el-upload-list--text">
                  <li v-for="(file, index) in files" :key="index" class="el-upload-list__item is-success" tabindex="0">
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
              <td colspan="3" style="height:21px" v-else>
                <div>
                  <el-upload class="upload-de" action="#" drag multiple :on-change="function(file, fileList) {
                        return handleChange(file, fileList);
                      }
                    " :on-remove="function(file, fileList) {
                        return handleRemove(file, fileList);
                      }
                    " ref="upload2" :auto-upload="false" :file-list="files">
                    <i class="el-icon-upload2" style="margin-top:5px;">
                      <span style="font-size:15px;">上传附件</span>
                    </i>
                  </el-upload>
                </div>
              </td>
            </tr>
            <tr>
              <td class="grayTD" style="font-size:20px;height:30px" colspan="8" v-if="submit.STATE == 'SENDBACK'">
                玉兰处理意见
              </td>
            </tr>
            <tr v-if="submit.STATE == 'SENDBACK'">
              <td class="grayTD" style="height:15px" colspan="1">
                初审意见或退回原因
              </td>
              <td style="height:15px" colspan="7">
                {{ submit.FIRST_AUDITION }}
              </td>
            </tr>
            <tr>
              <td class="grayTD" style="font-size:20px;height:30px" colspan="8" v-if="submit.STATE != 'SENDBACK'">
                玉兰处理意见
              </td>
            </tr>
            <tr v-if="submit.STATE != 'SENDBACK'">
              <td class="grayTD" style="height:15px" colspan="1">初审意见</td>
              <td style="height:15px" colspan="2">{{ submit.RETURN_TYPE }}</td>
              <td style="height:15px" colspan="5">
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
              <td style="height:15px" colspan="7">
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
                submit.STATE == 'RECEIVE' && submit.RETURN_TYPE == '客户邮寄'
              ">
              <td class="grayTD" style="height:15px">
                物流备注信息<span style="color:red;">*</span>
              </td>
              <td style="height:15px" colspan="7">
                <el-input v-model="submit.RETURN_TRANSINFO" placeholder="请填写邮寄的物流公司和物流单号" clearable class="inputStyle">
                </el-input>
              </td>
            </tr>
            <tr v-if="
                (submit.STATE == 'CUSTOMERAFFIRM' ||
                  submit.STATE == 'APPROVED') &&
                  submit.RETURN_TYPE == '客户邮寄'
              ">
              <td class="grayTD" style="height:15px">
                物流备注信息<span style="color:red;">*</span>
              </td>
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
            <tr v-if="submit.STATE != 'SUBMITTED'">
              <td class="grayTD" style="height:15px" colspan="1">附件</td>
              <td style="height:15px" colspan="7">
                <ul class="el-upload-list el-upload-list--text">
                  <li v-for="(file, index) in fileListForAudition" :key="index" class="el-upload-list__item is-success"
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
            <tr v-if="submit.STATE == 'CUSTOMERAFFIRM'">
              <td class="grayTD" style="font-size:20px;height:30px" colspan="8">
                玉兰处理结果
              </td>
            </tr>
            <tr v-if="submit.STATE == 'CUSTOMERAFFIRM'">
              <td class="grayTD" style="width:12%;height:15px">产品/项目</td>
              <td class="grayTD" style="width:14%;height:15px">型号</td>
              <td class="grayTD" style="width:10%;height:15px">单位</td>
              <td class="grayTD" style="width:8%;height:15px">数量</td>
              <td class="grayTD" style="width:8%;height:15px">金额</td>
              <td class="grayTD" style="width:13%;height:15px">质量问题</td>
              <td class="grayTD" style="width:15%;height:15px">处理意见</td>
              <td class="grayTD" style="width:20%;height:15px">附件</td>
            </tr>
            <tr v-if="submit.STATE == 'CUSTOMERAFFIRM'" v-for="(item, index) of processDetail" :key="index">
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
                <div style="margin:4px 0px 4px 4px" v-else>
                  广东玉兰集团股份有限公司<br />
                  市场部<br />
                  {{ new Date().getFullYear() }}年
                  {{
                      addZeroIfNeed(new Date().getMonth() + 1)
                    }}月
                  {{ addZeroIfNeed(new Date().getDate()) }}日
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
            <el-button type="success" size="mini" v-if="submit.STATE == 'CUSTOMERAFFIRM'" @click="_EditDetail(1)">同意
            </el-button>
            <el-button type="primary" size="mini" v-if="submit.STATE == 'SENDBACK'" @click="_EditDetail(2)">提交
            </el-button>
            <el-button type="primary" size="mini" v-if="submit.STATE == 'RECEIVE'" @click="_EditDetail(3)">保存
            </el-button>
            <el-button type="info" size="mini" @click="
                isEdit = false;
                RefundDetail = false;
              ">返回</el-button>
          </div>
        </div>
      </div>

      <!-- 旧系统提货单新增 -->
      <div v-show="isRefundAdd">
        <div>
          <table width="100%" border="0" cellspacing="0" cellpadding="0">
            <tr>
              <td style="font-size:20px;height:30px;text-align:center;" colspan="7">
                退货/赔偿电子申请书【新增】
              </td>
            </tr>
          </table>
        </div>
        <div class="table-c" style="margin-top:5px;">
          <table width="100%" border="0" cellspacing="0" cellpadding="0">
            <tr>
              <td class="grayTD" style="height:15px" colspan="1">客户代码</td>
              <td style="height:15px" colspan="1">
                {{ this.companyId }}
              </td>
              <td class="grayTD" style="height:15px" colspan="1">客户名称</td>
              <td style="height:15px" colspan="4">
                {{ this.companyName }}
              </td>
            </tr>
            <tr>
              <td class="grayTD" style="height:15px;width:12%;">提货单号</td>
              <td style="height:15px;width:20%;">{{ submit.SALE_NO }}</td>
              <td class="grayTD" style="height:15px;width:14%;">B2B订单号</td>
              <td style="height:15px;width:24%;" colspan="2">
                <el-input v-model="submit.ORDER_NO" placeholder="选填" clearable class="inputStyle">
                </el-input>
              </td>
              <td class="grayTD" style="height:15px;width:12%;">ERP订单号</td>
              <td style="height:15px;width:18%;" colspan="2">
                {{ this.CONTRACT_NO }}
              </td>
            </tr>
            <tr>
              <td class="grayTD" style="height:15px">
                联系人<span style="color:red;">*</span>
              </td>
              <td style="height:15px">
                <el-input v-model="submit.CONTACT_MAN" placeholder="请填写" clearable class="inputStyle">
                </el-input>
              </td>
              <td class="grayTD" style="height:15px">
                联系电话<span style="color:red;">*</span>
              </td>
              <td style="height:15px" colspan="2">
                <el-input v-model="submit.CONTACT_PHONE" placeholder="请填写联系电话" clearable class="inputStyle"
                  oninput="value=value.replace(/[^\d]/g,'')">
                </el-input>
              </td>
              <td class="grayTD" style="height:15px">物流单号</td>
              <td style="height:15px">
                <el-input v-model="submit.TRANS_ID" placeholder="选填" clearable class="inputStyle"
                  oninput="value=value.replace(/[^\d]/g,'')">
                </el-input>
              </td>
            </tr>
            <tr>
              <td class="grayTD" style="height:15px">
                问题描述<span style="color:red;">*</span>
              </td>
              <td style="height:15px" colspan="6">
                <el-input v-model="submit.NOTES" placeholder="请填写问题描述" clearable class="inputStyle">
                </el-input>
              </td>
            </tr>
            <tr>
              <td class="grayTD" colspan="1" style="height:15px;width:12%;">
                产品/项目
              </td>
              <td class="grayTD" colspan="2" style="height:15px;width:34%;">
                型号
              </td>
              <td class="grayTD" colspan="1" style="height:15px;width:10%;">
                单位
              </td>
              <td class="grayTD" colspan="1" style="height:15px;width:14%;">
                数量<span style="color:red;">*</span>
              </td>
              <td class="grayTD" colspan="2" style="height:15px;width:30%;">
                上传相关信息<span style="color:red;">*</span>
              </td>
            </tr>
            <tr>
              <td colspan="1" style="height:21px">
                {{ submit.PRODUCTION_VERSION }}
              </td>
              <td colspan="2" style="height:21px">{{ submit.ITEM_NO }}</td>
              <td colspan="1" style="height:21px">{{ submit.UNIT }}</td>
              <td colspan="1" style="height:21px">
                <input v-model="submit.QTY" placeholder="请填写" clearable class="inputStyle" oninput="value=value.replace(/[^\d.]/g,'')
                           .replace(/^\./g, '').replace(/\.{2,}/g, '.')
                           .replace('.', '$#$').replace(/\./g, '')
                           .replace('$#$', '.')
                           .slice(0,value.indexOf('.') === -1? value.length: value.indexOf('.') + 3)" />
              </td>
              <td colspan="2" style="height:21px">
                <div>
                  <el-upload class="upload-de" action="#" drag multiple :on-change="function(file, fileList) {
                        return handleChange(file, fileList);
                      }
                    " :on-remove="function(file, fileList) {
                        return handleRemove(file, fileList);
                      }
                    " :http-request="uploadFiles" ref="upload" :auto-upload="false" :file-list="files">
                    <i class="el-icon-upload2" style="margin-top:5px;">
                      <span style="font-size:15px;">上传附件</span>
                    </i>
                  </el-upload>
                </div>
              </td>
            </tr>
            <tr style="height:90px">
              <td colspan="7" border="0px" style="font-size:13px;color:gray;text-align:left;">
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
                <div>
                  广东玉兰集团股份有限公司<br />
                  市场部<br />
                  {{ new Date().getFullYear() }}年
                  {{ new Date().getMonth() + 1 }}月 {{ new Date().getDate() }}日
                </div>
              </td>
              <td colspan="3" border="0px" style="font-size:13px;color:gray;text-align:center;">
                <div>
                  经销商
                  <span></span><br />
                  <span> 年 月 日</span>
                </div>
              </td>
            </tr>
          </table>

          <div style="text-align:center;margin-top:5px">
            <el-button type="success" size="mini" @click="_addRefundSubmit()">提交</el-button>
            <el-button type="info" size="mini" @click="
                isRefundAdd = false;
                RefundDetail = false;
              ">返回</el-button>
          </div>
        </div>
      </div>
    </el-dialog>

    <!-- 旧系统提货单新增，提货单号输入界面 -->
    <el-dialog title="请确保输入的信息准确无误" :visible.sync="getItemFromSaleNo" :close-on-click-modal="false" width="20%"
      top="20%" append-to-body>
      <div v-if="inputItemNo">
        <div>
          <table width="100%" border="0" cellspacing="0" cellpadding="0">
            <tr>
              <td style="font-size:15px;height:16px;text-align:left;" colspan="1">
                请选择产品型号
              </td>
            </tr>
          </table>
        </div>
        <div class="table-c">
          <table width="100%" border="0" cellspacing="0" cellpadding="0">
            <tr>
              <td colspan="1" rowspan="1" style="height:15px">
                <el-select style="width:99%;" v-model="ITEM_NO" filterable placeholder="">
                  <el-option v-for="item in ItemNoArray" :key="item.value" :label="item.label" :value="item.value">
                  </el-option>
                </el-select>
              </td>
            </tr>
          </table>

          <div style="text-align:center;margin-top:20px">
            <el-button type="success" size="mini" @click="_AddRefundForSaleNoAndItemNo()">确定</el-button>
            <el-button type="info" size="mini" @click="
                getItemFromSaleNo = false;
                ITEM_NO = '';
                SALE_NO = '';
              ">取消</el-button>
          </div>
        </div>
      </div>
      <!-- 旧系统提货单新增，产品型号选择界面，再来个div-->
      <div v-if="inputSaleNo">
        <div>
          <table width="100%" border="0" cellspacing="0" cellpadding="0">
            <tr>
              <td style="font-size:15px;height:16px;text-align:left;" colspan="1">
                请输入提货单号（注意空格）
              </td>
            </tr>
          </table>
        </div>
        <div class="table-c">
          <table width="100%" border="0" cellspacing="0" cellpadding="0">
            <tr>
              <td colspan="1" rowspan="1" style="height:15px">
                <el-input v-model="SALE_NO" placeholder="" clearable class="inputStyle">
                </el-input>
              </td>
            </tr>
          </table>

          <div style="text-align:center;margin-top:20px">
            <el-button type="success" size="mini" @click="_GetItemArray()">确定</el-button>
            <el-button type="info" size="mini" @click="
                getItemFromSaleNo = false;
                SALE_NO = '';
              ">取消</el-button>
          </div>
        </div>
      </div>
    </el-dialog>

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
  updatePrinted
} from "@/api/refund";
import { getReturnInfo, GetQtyDelivery } from "@/api/orderListASP";
import {
  GetUserCompensation,
  GetCompensationById,
  GetNoPrinted,
  ApprovedUpdate,
  UpdatePrintedById,
  DeleteCompensation,
  CheckOrderAndItemNo,
  InsertCompensation,
  UpdateState,
  SendBackUpdate,
  UpdateFirstAudition,
  GetItemArray,
  NewUploadFiles
} from "@/api/paymentASP";
import { downLoadFile } from "@/common/js/downLoadFile";
import { mapMutations } from "vuex";
import { mapState } from "vuex";
export default {
  name: "refundExamine",
  data() {
    return {
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
      files: [], //按添加顺序排列的待上传附件（用于handlechange及判断）
      fileList: [], //按实际上传到服务器中的存储客户意见的附件
      fileListForAudition: [], //存储初审意见附件
      fileListForProcess: [], //存储处理结果附件
      submitHead: [], //存储表头数据
      deleteFile: [], //删除的上传文件
      complaintDetail: false,
      isAdd: false,
      isCheck: false,
      isEdit: false,
      RefundDetail: false,
      isRefundAdd: false,
      getItemFromSaleNo: false, //旧系统提单-获取产品型号的界面
      SELECT_STATUS: "NEEDPROCESSING", //存储下拉框的值
      beginTime: "", //查询的开始时间
      finishTime: "", //查询的结束时间
      companyId: Cookies.get("customerMainId"), //公司Id
      CID: Cookies.get("cid"),
      CNAME: Cookies.get("realName"),
      companyName: "", //公司名称
      selectItemNo: "", //搜索栏产品型号
      selectCNAME: "", //搜索栏姓名
      selectDealor: "", //搜索栏创建人名
      zongshuliang: "",
      daifashuliang: "",
      kuaidi100: "",
      kuaididanhao: "",
      PRODUCTION_VERSION: "", //产品型号
      SALE_NO: "", //提货单号
      ITEM_NO: "", //产品型号
      CONTRACT_NO: "", //ERP订单号
      UNIT: "",
      QtyLimit: "", //出货数量上限
      FormRight: false,
      dateStamp: "",
      uploadSuccessNum: 0, //上传成功的文件数
      fileChange: false,
      inputSaleNo: false, //是否处于输入提货单号状态
      inputItemNo: false, //是否处于输入产品型号状态
      dateString: "",
      fileNumber: 0, //存储客户上传文件数量
      fileNameList: [], //存储用户上传附件的名称
      //单据状态
      statusArray: [
        { value: null, label: "全部状态" },
        { value: "NEEDPROCESSING", label: "待处理" },
        { value: "SUBMITTED", label: "已提交" },
        { value: "SENDBACK", label: "退回修改" },
        { value: "RECEIVE", label: "已接收" },
        { value: "CUSTOMERAFFIRM", label: "客户确认中" },
        { value: "APPROVED", label: "客户同意" }
      ],
      returnArray: [
        //退货方式
        {
          label: "玉兰取货",
          value: "玉兰取货"
        },
        {
          label: "客户邮寄",
          value: "客户邮寄"
        },
        {
          label: "无需退货",
          value: "无需退货"
        }
      ],
      processArray: [
        //处理意见
        {
          label: "赔偿",
          value: "赔偿"
        },
        {
          label: "退货",
          value: "退货"
        },
        {
          label: "无质量问题",
          value: "无质量问题"
        }
      ],
      //旧系统提货-输入提货单号，弹出相应的产品型号
      ItemNoArray: []
    };
  },
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
    }
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
    //查询满足条件的该用户的退货赔偿
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
        itemNo: this.selectItemNo //产品号S
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
      GetUserCompensation(filter(obj))
        .then(res => {
          this.tableData = res.data;
          this.tableData.forEach(item => {
            item.PRINTED = item.PRINTED === "0" ? true : false;
          });
          this.allNum = res.count;
        })
        .catch(err => {
          this.tableData = [];
          this.allNum = 0;
        });
    },
    //查看详情
    _CheckDetail(val, type) {
      this.FormRight = false;
      this.uploadSuccessNum = 0;
      this.submit = [];
      this.fileList = [];
      this.files = [];
      this.fileListForAudition = [];
      this.fileListForProcess = [];
      this.processDetail = [];
      this.fileNumber = 0;
      this.fileNameList = [];
      let data = {
        ID: val.ID,
        STATE: val.STATE
      };
      GetCompensationById(data).then(res => {
        if (res.count > 0) {
          this.submit = res.data[0];
          if (
            this.submit.STATE == "CUSTOMERAFFIRM" ||
            this.submit.STATE == "APPROVED"
          ) {
            this.processDetail = res.data;
            var totalMoney = 0;
            for (let j = 0; j < res.count; j++) {
              totalMoney = totalMoney.add(this.processDetail[j].P_MONEY);
            }
            this.submit.TOTALMONEY = totalMoney;
          }
          if (this.submit.STATE == "SENDBACK") {
            GetQtyDelivery({
              companyId: this.companyId,
              SALE_NO: this.submit.SALE_NO,
              ITEM_NO: this.submit.ITEM_NO
            }).then(res => {
              if (res.code == 0 && res.data.length > 0) {
                this.QtyLimit = res.data[0].QTY_DELIVER;
              }
            });
          }
        }
        //查询时，将对应客户意见的附件的字段拆解开来，并作为对象传入文件集合中
        var list = this.submit.ATTACHMENT_FILE.split(";");
        for (var i = 0; i < list.length - 1; i++) {
          var index = list[i].lastIndexOf("/");
          var fileName = list[i].substr(index + 1);
          this.files.push({
            name: fileName,
            url: list[i]
          });
        }
        if (list.length >= 2) {
          var findIndex = list[list.length - 2].lastIndexOf("-");
          this.fileNumber = parseInt(
            list[list.length - 2].substr(findIndex + 1, 1)
          );
        }
        //查询时，将对应初审意见的附件的字段拆解开来，并作为对象传入文件集合中
        var list2 = this.submit.FIRST_AUDITION_FILE.split(";");
        for (var i = 0; i < list2.length - 1; i++) {
          var index = list2[i].lastIndexOf("/");
          var fileName = list2[i].substr(index + 1);
          this.fileListForAudition.push({
            name: fileName,
            url: list2[i]
          });
        }
        //查询时，将对应处理结果的附件的字段拆解开来，并作为对象传入文件集合中
        for (let j = 0; j < this.processDetail.length; j++) {
          //初始化
          this.processDetail[j].fileListForProcess = [];
          var list3 = this.processDetail[j].PROCESS_FILE.split(";");
          for (var i = 0; i < list3.length - 1; i++) {
            var index = list3[i].lastIndexOf("/");
            var fileName = list3[i].substr(index + 1);
            this.processDetail[j].fileListForProcess.push({
              name: fileName,
              url: list3[i]
            });
          }
        }
        this.dateStamp = new Date().getTime();
        if (type == 1) {
          this.isEdit = false;
          this.isCheck = true;
          this.isRefundAdd = false;
        } else {
          if (this.submit.STATE == "SENDBACK") {
            this.FormRight = true;
          }
          this.isEdit = true;
          this.isCheck = false;
          this.isRefundAdd = false;
        }
        this.RefundDetail = true;
      });
    },
    //保存修改
    _EditDetail(val) {
      //客户确认中的修改
      if (val == 1) {
        this.submit.STATE = "APPROVED";
        ApprovedUpdate({ head: this.submit }).then(res => {
          if (res.code == 0) {
            this.$alert("修改成功", "提示", {
              confirmButtonText: "确定",
              type: "success"
            });
            this.releaseBadge("newRefund1"); //刷新角标
            this.refresh();
            this.RefundDetail = false;
            return;
          } else {
            this.$alert("修改失败，请稍后重试", "提示", {
              confirmButtonText: "确定",
              type: "warning"
            });
            return;
          }
        });
      } else if (val == 2) {
        //退回修改
        //判断是否填完所有信息
        if (
          !this.submit.CONTACT_MAN ||
          !this.submit.CONTACT_PHONE ||
          !this.submit.NOTES ||
          !String(this.submit.QTY)
        ) {
          this.$alert("请完善信息，除选填外都必填", "提示", {
            confirmButtonText: "确定",
            type: "warning"
          });
          return;
        }
        // if (this.submit.QTY > this.QtyLimit) {
        //   this.$alert("填写数量不能超过实际发货数量", "提示", {
        //     confirmButtonText: "确定",
        //     type: "warning"
        //   });
        //   return;
        // }
        //判断是否上传附件
        if (this.files.length == 0) {
          this.$alert("请上传相关附件", "提示", {
            confirmButtonText: "确定",
            type: "warning"
          });
          return;
        }
        //判断上传附件的形式为图片或视频
        if (this.FormRight == false) {
          this.$alert("提交失败，附件仅能上传图片或视频", "提示", {
            confirmButtonText: "确定",
            type: "warning"
          });
          return;
        }
        if (this.fileChange) {
          //文件发生改变，重新上传一次(仅选中修改后的文件，而不是所有文件效率会更高)
          this.$refs.upload2.submit();
        } else {
          //仅删除文件
          if (this.deleteFile.length > 0) {
            for (let i = 0; i < this.deleteFile.length; i++) {
              this.submit.ATTACHMENT_FILE = "";
              for (var j = 0; j < this.files.length; j++) {
                this.submit.ATTACHMENT_FILE += this.files[j].url + ";";
              }
            }
          }
          SendBackUpdate({
            updateState: "SUBMITTED",
            detail: this.submit,
            attchmentChange: this.fileChange,
            deleteFile: this.deleteFile
          }).then(res => {
            if (res.code == 0) {
              this.$alert("重新提交成功", "提示", {
                confirmButtonText: "确定",
                type: "success"
              });
              this.currentPage = 1;
              this.releaseBadge("newRefund1"); //刷新角标
              this.refresh();
              this.RefundDetail = false;
              return;
            } else {
              this.$alert("提交失败，请稍后重试", "提示", {
                confirmButtonText: "确定",
                type: "warning"
              });
              return;
            }
          });
        }
      } else if (val == 3) {
        //判断是否填完所有信息
        if (!this.submit.RETURN_TRANSINFO) {
          this.$alert("请完善退货邮寄物流信息", "提示", {
            confirmButtonText: "确定",
            type: "warning"
          });
          return;
        }
        UpdateFirstAudition({
          head: this.submit,
          type: val,
          attchmentChange: false,
          deleteFile: null,
          firstAddFile: true
        }).then(res => {
          if (res.code == 0) {
            this.$alert("退货邮寄信息保存成功", "提示", {
              confirmButtonText: "确定",
              type: "success"
            });
            this.refresh();
            this.RefundDetail = false;
            return;
          } else {
            this.$alert("保存失败，请稍后重试", "提示", {
              confirmButtonText: "确定",
              type: "warning"
            });
            return;
          }
        });
      }
    },
    //删除
    _Delete(val) {
      this.$confirm("是否删除该条记录？删除后将不可恢复！", "提示", {
        confirmButtonText: "确定删除",
        cancelButtonText: "我再想想",
        type: "warning"
      }).then(() => {
        DeleteCompensation({ id: val }).then(res => {
          if (res.code == 0) {
            this.$alert("删除成功", "提示", {
              confirmButtonText: "确定",
              type: "success"
            });
            this.refresh();
            return;
          } else {
            this.$alert("删除失败，请稍后重试", "提示", {
              confirmButtonText: "确定",
              type: "warning"
            });
            return;
          }
        });
      });
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
    //给时间加前缀'0'
    addZeroIfNeed(num) {
      if (num < 10) {
        return "0" + num;
      }
      return num;
    },
    //执行打印操作
    printRefund() {
      printJS({
        printable: "printTable",
        type: "html",
        maxWidth: 1300,
        headerStyle: "margin: -2px;",
        targetStyles: ["*"]
      });
    },
    //初始化新增记录的信息
    addRefund() {
      this.FormRight = false;
      this.fileList = [];
      this.files = [];
      this.dateStamp = new Date().getTime();
      this.fileNumber = 0;
      this.FormRight = true;
      this.uploadSuccessNum = 0;
      this.fileNameList = [];
      this.submitHead = {
        ID: "",
        ERP_CREATOR: this.CID, //创建人编号
        ERP_CREATORNAME: this.CNAME, //创建人姓名
        CID: this.companyId, //客户编号
        CNAME: this.companyName, //客户姓名
        SENDBACK_REASON: "", //退回理由
        ITEM_COUNT: "", //总货品数量
        ITEM_MAX_INDEX: "", //最大索引
        STATE: "", //状态
        PRINTED: "", //打印方式
        FIRST_AUDITION: "", //初审意见
        RETURN_TYPE: "", //退货类型
        RETURN_ADDRESS: "", //退货地址
        REASSURE_TS: "", //签订日期
        DEALMAN_CODE: "",
        DEAL_TS: "",
        DEALMAN_NAME: "",
        KIND: "", //是否为旧系统，1为旧系统提单售后
        TRANS_ID: "" //物流单号
      };
      this.submit = {
        RTCB_ID: "", //退货单ID
        ITEM_NO: "", //产品型号
        PRODUCTION_VERSION: this.PRODUCTION_VERSION, //版本（项目、产品）
        UNIT: this.UNIT, //单位
        QTY: "", //数量
        NOTES: "", //问题描述
        CONTACT_MAN: "", //联系人
        CONTACT_PHONE: "", //联系方式
        SALE_NO: this.SALE_NO, //提货单号
        ORDER_NO: "", //B2B订单号
        CONTRACT_NO: this.CONTRACT_NO,
        ITEM_NO: this.ITEM_NO, //产品型号
        C_TRANSBILL: "", //物流单号
        NOTE: "", //类型
        fileList: [], //附件列表
        ATTACHMENT_FILE: "", //附件
        ATTACHMENT_FILE_FOLDER: "" //附件文件夹
      };
      this.isRefundAdd = true;
      this.isEdit = false;
      this.isCheck = false;
      this.RefundDetail = true;
      GetQtyDelivery({
        companyId: this.companyId,
        SALE_NO: this.SALE_NO,
        ITEM_NO: this.ITEM_NO
      }).then(res => {
        if (res.code == 0 && res.data.length > 0) {
          this.QtyLimit = res.data[0].QTY_DELIVER;
        }
      });
    },
    //旧系统提单售后新增
    addRefundRecord() {
      CheckOrderAndItemNo({
        CID: this.companyId,
        SALE_NO: this.SALE_NO,
        ITEM_NO: this.ITEM_NO
      }).then(res => {
        if (res.data.length != 0) {
          this.$confirm(
            "此前已对该订单该型号发起退货赔偿申请，是否要再次申请",
            "提示",
            {
              confirmButtonText: "确定",
              cancelButtonText: "取消",
              type: "warning"
            }
          ).then(() => {
            this.addRefund();
          });
        } else {
          this.addRefund();
        }
      });
    },
    //新增售后记录提交
    _addRefundSubmit() {
      //判断是否填完所有信息
      if (
        !this.submit.CONTACT_MAN ||
        !this.submit.CONTACT_PHONE ||
        !this.submit.NOTES ||
        !String(this.submit.QTY)
      ) {
        this.$alert("请完善信息，除选填外都必填", "提示", {
          confirmButtonText: "确定",
          type: "warning"
        });
        return;
      }
      if (this.submit.QTY <= 0) {
        this.$alert("填写数量必须为正数", "提示", {
          confirmButtonText: "确定",
          type: "warning"
        });
        return;
      }
      // if (this.submit.QTY > this.QtyLimit) {
      //   this.$alert("填写数量不能超过实际发货数量", "提示", {
      //     confirmButtonText: "确定",
      //     type: "warning"
      //   });
      //   return;
      // }
      //判断是否上传附件
      if (this.files.length == 0) {
        this.$alert("请上传相关附件", "提示", {
          confirmButtonText: "确定",
          type: "warning"
        });
        return;
      }
      //判断上传附件的形式为图片或视频
      if (this.FormRight == false) {
        this.$alert("提交失败，附件仅能上传图片或视频", "提示", {
          confirmButtonText: "确定",
          type: "warning"
        });
        return;
      }
      this.$refs.upload.submit();
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
        list10.length > 1
      ) {
        this.FormRight = true;
        this.files = fileList;
        this.fileChange = true;
      } else {
        this.FormRight = false;
        this.files = [];
        this.$alert("请上传图片或视频，否则无法成功提交", "提示", {
          confirmButtonText: "确定",
          type: "warning"
        });
        return;
      }
    },
    handleRemove(file, fileList) {
      this.files = fileList;
      if ((file.status = "success")) {
        this.deleteFile.push(file.url);
        this.fileNameList.splice(this.fileNameList.length - 1, 1);
      }
    },
    //新增
    sumbitNEWANSYC() {
      //相当于同步，等提交成功后再执行
      //附件拼接
      for (let j = 0; j < this.fileList.length; j++) {
        this.submit.ATTACHMENT_FILE +=
          "/Files/RTCB_ITEM/" +
          this.companyId +
          "/" +
          this.dateStamp +
          "/" +
          this.fileList[j] +
          ";";
      }

      this.submit.ATTACHMENT_FILE_FOLDER =
        "/Files/RTCB_ITEM/" + this.companyId + "/" + this.dateStamp;
      this.submit.ITEM_INDEX = 1;
      this.submitHead.ERP_CREATOR = this.CID;
      this.submitHead.ERP_CREATORNAME = this.CNAME;
      this.submitHead.CID = this.companyId;
      this.submitHead.CNAME = this.companyName;
      this.submitHead.SENDBACK_REASON = null;
      this.submitHead.ITEM_COUNT = 1;
      this.submitHead.ITEM_MAX_INDEX = 1;
      this.submitHead.SALE_NO = this.submit.SALE_NO;
      this.submitHead.ORDER_NO = this.submit.ORDER_NO;
      this.submitHead.KIND = "1";
      this.submitHead.TRANS_ID = this.submit.TRANS_ID;
      InsertCompensation({ head: this.submitHead, details: this.submit })
        .then(res => {
          UpdateState({
            id: res.data.ID,
            state: "SUBMITTED"
          })
            .then(res => {
              this.$alert("提交成功", "提示", {
                type: "success",
                confirmButtonText: "好的"
              });
            })
            .catch(() => {
              throw "提交失败";
            });
          this.refresh();
          this.RefundDetail = false;
        })
        .catch(err => {
          this.$alert("添加失败", "提示", {
            type: "warning",
            confirmButtonText: "好的"
          }).catch(() => {});
        });
    },
    //待修改
    submitEDITANSYC() {
      //附件拼接
      //相当于同步，等提交成功后再执行
      this.submit.ATTACHMENT_FILE = "";
      for (let j = 0; j < this.fileList.length; j++) {
        this.submit.ATTACHMENT_FILE +=
          "/Files/RTCB_ITEM/" +
          this.companyId +
          "/" +
          this.dateStamp +
          "/" +
          this.fileList[j] +
          ";";
      }
      this.submit.ATTACHMENT_FILE_FOLDER =
        "/Files/RTCB_ITEM/" + this.companyId + "/" + this.dateStamp;
      SendBackUpdate({
        updateState: "SUBMITTED",
        detail: this.submit,
        attchmentChange: this.fileChange,
        deleteFile: this.deleteFile
      }).then(res => {
        if (res.code == 0) {
          this.$alert("提交成功", "提示", {
            confirmButtonText: "确定",
            type: "success"
          });
          this.currentPage = 1;
          this.releaseBadge("newRefund1"); //刷新角标
          this.refresh();
          this.RefundDetail = false;
          return;
        } else {
          this.$alert("提交失败，请稍后重试", "提示", {
            confirmButtonText: "确定",
            type: "warning"
          });
          return;
        }
      });
    },
    //获取提货单号
    GetSaleNoAndItemNo() {
      //初始化参数
      this.getItemFromSaleNo = true;
      this.SALE_NO = "";
      this.ITEM_NO = "";
      this.inputSaleNo = true;
      this.inputItemNo = false;
      this.ItemNoArray = [];
    },
    //获得输入提货单号对应的产品型号
    _GetItemArray() {
      if (this.SALE_NO == "") {
        this.$alert("提货单号不能为空", "提示", {
          confirmButtonText: "确定",
          type: "warning"
        });
        return;
      }
      this.SALE_NO = this.SALE_NO.toUpperCase();
      GetItemArray({ SALE_NO: this.SALE_NO })
        .then(res => {
          if (res.code == 0) {
            for (var i = 0; i < res.data.length; i++) {
              //这一部分应该在编辑里使用（可以进行初审的时候使用）
              this.ItemNoArray[i] = new Object();
              this.ItemNoArray[i].label = res.data[i].ITEM_NO;
              this.ItemNoArray[i].value = res.data[i].ITEM_NO;
            }
          }
        })
        .then(() => {
          if (this.ItemNoArray.length == 0) {
            this.$alert("输入的提货单号有误", "提示", {
              confirmButtonText: "确定",
              type: "warning"
            });
            return;
          } else {
            this.inputSaleNo = false;
            this.inputItemNo = true;
          }
        });
    },
    //输入提货单号和产品型号后，弹出退货赔偿界面
    _AddRefundForSaleNoAndItemNo() {
      getReturnInfo({
        companyId: this.companyId,
        SALE_NO: this.SALE_NO,
        ITEM_NO: this.ITEM_NO
      })
        .then(res => {
          if (res.code == 0) {
            this.companyName = res.data[0].CUSTOMER_NAME;
            this.CONTRACT_NO = res.data[0].CONTRACT_NO;
            this.PRODUCTION_VERSION = res.data[0].PRODUCTVERSION_NAME;
            this.UNIT = res.data[0].NOTE;
          }
        })
        .then(() => {
          this.getItemFromSaleNo = false;
          this.inputItemNo = false;
          this.addRefundRecord();
        })
        .catch(() => {});
    },
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
          type:"customer",
        }
      })
        .then(res => {
          if (res.code == 0) {
            this.fileList.push(res.data);
            this.uploadSuccessNum += 1;
            if (this.uploadSuccessNum == this.files.length) {
              if (this.isRefundAdd) {
                this.sumbitNEWANSYC();
              } else {
                this.submitEDITANSYC();
              }
            }
          }
        })
        .then(() => {})
        .catch(() => {});
    },

    ...mapMutations("badge", ["addBadge", "releaseBadge"])
  },
  computed: {
    //返回大写形式的总金额
    totalMoneyUpper: function() {
      return digitUppercase(this.submit.TOTALMONEY);
    }
  },
  created() {
    this.GetNowDate();
    this.refresh();
  },
  activated: function() {
    this.refresh();
  }
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
.noprint {
  display: none;
}
.upload-de .el-upload-dragger {
  height: 25px;
  width: 200px;
}
</style>