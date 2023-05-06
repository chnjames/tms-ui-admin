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
// 创建BOM需求
export function createBom(data) {
  return request({
    url: '/operations/project-bom/create',
    method: 'post',
    data
  })
}
// 删除BOM需求
export function deleteBom(id) {
  return request({
    url: '/operations/project-bom/delete?id=' + id,
    method: 'delete'
  })
}
// 获得BOM需求列表
export function getBomList(query) {
  return request({
    url: '/operations/project-bom/list',
    method: 'get',
    params: query
  })
}
// 发起出库
export function createOutbound(data) {
  return request({
    url: '/operations/project-bom/outbound',
    method: 'post',
    data
  })
}
// 更新BOM需求
export function updateBom(data) {
  return request({
    url: '/operations/project-bom/update',
    method: 'put',
    data
  })
}
// 富文本文件上传
export function uploadFile(data) {
  return request({
    url: '/operations/project/rich-text/file/upload',
    method: 'post',
    data
  })
}
/**
 * 任务列表/执行记录
 */
// 获得任务附件列表
export function getTaskFileList(query) {
  return request({
    url: '/operations/task/attachment/list',
    method: 'get',
    params: query
  })
}
// 创建任务
export function createTask(data) {
  return request({
    url: '/operations/task/create',
    method: 'post',
    data
  })
}
// 批量创建任务
export function createTaskBatch(data) {
  return request({
    url: '/operations/task/create/batch',
    method: 'post',
    data
  })
}
// 获得任务
export function getTask(id) {
  return request({
    url: '/operations/task/get?id=' + id,
    method: 'get'
  })
}
// 获得任务分页
export function getTaskPage(query) {
  return request({
    url: '/operations/task/page',
    method: 'get',
    params: query
  })
}
// 获取任务精简信息列表
export function getTaskSimpleList(query) {
  return request({
    url: '/operations/task/list-all-simple',
    method: 'get',
    params: query
  })
}
// 上传附件
export function uploadTaskFile(data) {
  return request({
    url: '/operations/task/attachment/create',
    method: 'post',
    data
  })
}
/**
 * 任务计划
 */
// 创建任务计划
export function createTaskPlan(data) {
  return request({
    url: '/operations/task-plan/create',
    method: 'post',
    data
  })
}
// 删除任务计划
export function deleteTaskPlan(id) {
  return request({
    url: '/operations/task-plan/delete?id=' + id,
    method: 'delete'
  })
}
// 获得任务计划
export function getTaskPlan(id) {
  return request({
    url: '/operations/task-plan/get?id=' + id,
    method: 'get'
  })
}
// 获得任务计划分页
export function getTaskPlanPage(query) {
  return request({
    url: '/operations/task-plan/page',
    method: 'get',
    params: query
  })
}
// 更新任务计划
export function updateTaskPlan(data) {
  return request({
    url: '/operations/task-plan/update',
    method: 'put',
    data
  })
}
