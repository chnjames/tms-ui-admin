import request from '@/utils/request'

/**
 * 运营报表
 */
// 获取销售收入和客户欠款
export function getSalesAndArrears(query) {
  return request({
    url: '/report/operations/income-owe',
    method: 'get',
    params: query
  })
}
// 获取财务概览
export function getFinanceOverview(query) {
  return request({
    url: '/report/operations/finance-overview',
    method: 'get',
    params: query
  })
}
// 采购量和库存量
export function getPurchaseAndStock(query) {
  return request({
    url: '/report/operations/buying-stock',
    method: 'get',
    params: query
  })
}
// 获取销售总览
export function getSalesOverview(query) {
  return request({
    url: '/operations/payment/overview/page',
    method: 'get',
    params: query
  })
}
// 获得物料采购总览分页
export function getMaterialPurchasePage(query) {
  return request({
    url: '/warehouse/material-buying/overview/page',
    method: 'get',
    params: query
  })
}
// 获得库存分页
export function getStockPage(query) {
  return request({
    url: '/warehouse/stock/page',
    method: 'get',
    params: query
  })
}
// 获取财务分析
export function getFinanceAnalysis(query) {
  return request({
    url: '/report/operations/finance-analysis',
    method: 'get',
    params: query
  })
}
// 获取任务甘特图
export function getTaskGantt(query) {
  return request({
    url: '/report/operations/task-gantt',
    method: 'get',
    params: query
  })
}
