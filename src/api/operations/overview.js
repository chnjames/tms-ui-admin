import request from '@/utils/request'

// 创建项目主表
export function createOverview(data) {
  return request({
    url: '/operations/project/create',
    method: 'post',
    data: data
  })
}

// 更新项目主表
export function updateOverview(data) {
  return request({
    url: '/operations/project/update',
    method: 'put',
    data: data
  })
}

// 删除项目主表
export function deleteOverview(id) {
  return request({
    url: '/operations/project/delete?id=' + id,
    method: 'delete'
  })
}

// 获得项目主表
export function getOverview(id) {
  return request({
    url: '/operations/project/get?id=' + id,
    method: 'get'
  })
}

// 获得项目主表分页
export function getOverviewPage(query) {
  return request({
    url: '/operations/project/page',
    method: 'get',
    params: query
  })
}

// 更新项目关注人
export function updateOverviewFollowers(data) {
  return request({
    url: '/operations/project/follower/update',
    method: 'put',
    data: data
  })
}

// 导出项目主表 Excel
export function exportOverviewExcel(query) {
  return request({
    url: '/operations/project/export-excel',
    method: 'get',
    params: query,
    responseType: 'blob'
  })
}

// 创建项目合同
export function createContract(data) {
  return request({
    url: '/operations/contract/create',
    method: 'post',
    data: data
  })
}

// 删除项目合同
export function deleteContract(id) {
  return request({
    url: '/operations/contract/delete?id=' + id,
    method: 'delete'
  })
}

// 获得项目合同分页
export function getContractPage(query) {
  return request({
    url: '/operations/contract/page',
    method: 'get',
    params: query
  })
}

// 创建项目文档
export function createDocument(data) {
  return request({
    url: '/operations/document/create',
    method: 'post',
    data: data
  })
}

// 删除项目文档
export function deleteDocument(id) {
  return request({
    url: '/operations/document/delete?id=' + id,
    method: 'delete'
  })
}

// 获得项目文档分页
export function getDocumentPage(query) {
  return request({
    url: '/operations/document/page',
    method: 'get',
    params: query
  })
}
// 创建收款项
export function createReceipt(data) {
  return request({
    url: '/operations/payment/create',
    method: 'post',
    data
  })
}
// 获取收款项
export function getReceipt(id) {
  return request({
    url: '/operations/payment/get?projectId=' + id,
    method: 'get'
  })
}
// 启动收款项
export function startReceipt(id) {
  return request({
    url: '/operations/payment/start',
    method: 'post',
    data: { id }
  })
}

/**
 * BOM需求
 */
// 发起采购
export function createPurchase(data) {
  return request({
    url: '/operations/project-bom/buy',
    method: 'post',
    data
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

