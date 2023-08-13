import request from '@/utils/request'

// 创建供应商
export function createSupplier(data) {
  return request({
    url: '/config/supplier/create',
    method: 'post',
    data: data
  })
}

// 更新供应商
export function updateSupplier(data) {
  return request({
    url: '/config/supplier/update',
    method: 'put',
    data: data
  })
}

// 删除供应商
export function deleteSupplier(query) {
  return request({
    url: '/config/supplier/delete',
    method: 'delete',
    params: query
  })
}

// 获得供应商
export function getSupplier(query) {
  return request({
    url: '/config/supplier/get',
    method: 'get',
    params: query
  })
}

// 获得供应商分页
export function getSupplierPage(query) {
  return request({
    url: '/config/supplier/page',
    method: 'get',
    params: query
  })
}

// 导出供应商 Excel
export function exportSupplierExcel(query) {
  return request({
    url: '/config/supplier/export-excel',
    method: 'get',
    params: query,
    responseType: 'blob'
  })
}
// 获取供应商精简信息列表
export function getSupplierSimpleList(query) {
  return request({
    url: '/config/supplier/list-all-simple',
    method: 'get',
    params: query
  })
}
// 供应商模板下载
export function downloadSupplierTemplate() {
  return request({
    url: '/config/supplier/import-excel-template',
    method: 'get',
    responseType: 'blob',
    header: {
      headers: { 'Content-Type': 'application/x-download' }
    }
  })
}
// 供应商批量导入excel
export function importSupplierExcel(data) {
  return request({
    url: '/config/supplier/import-excel',
    method: 'post',
    data
  })
}

