import request from '@/utils/request'

/**
 * 任务报表
 */
// 获取任务数
export function getTaskQty(query) {
  return request({
    url: '/report/task/task-qty',
    method: 'get',
    params: query
  })
}
// 获取任务领取
export function getTaskReceive(query) {
  return request({
    url: '/report/task/task-pick',
    method: 'get',
    params: query
  })
}
// 获取工时
export function getTaskWorkTime(query) {
  return request({
    url: '/report/task/task-minute',
    method: 'get',
    params: query
  })
}
// 获取KPI
export function getTaskKpi(query) {
  return request({
    url: '/report/task/task-kpi',
    method: 'get',
    params: query
  })
}
