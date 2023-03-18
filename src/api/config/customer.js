import request from '@/utils/request'

// 创建客户
export function createCustomer(data) {
  return request({
    url: '/config/customer/create',
    method: 'post',
    data: data
  })
}

// 更新客户
export function updateCustomer(data) {
  return request({
    url: '/config/customer/update',
    method: 'put',
    data: data
  })
}

// 删除客户
export function deleteCustomer(query) {
  return request({
    url: '/config/customer/delete',
    method: 'delete',
    params: query
  })
}

// 获得客户
export function getCustomer(query) {
  return request({
    url: '/config/customer/get',
    method: 'get',
    params: query
  })
}

// 获得客户分页
export function getCustomerPage(query) {
  return request({
    url: '/config/customer/page',
    method: 'get',
    params: query
  })
}

// 导出客户 Excel
export function exportCustomerExcel(query) {
  return request({
    url: '/config/customer/export-excel',
    method: 'get',
    params: query,
    responseType: 'blob'
  })
}
// 获取客户精简信息列表
export function getCustomerSimpleList(query) {
  return request({
    url: '/config/customer/list-all-simple',
    method: 'get',
    params: query
  })
}
// 获取客户联系人精简信息列表
export function getCustomerContactSimpleList() {
  return request({
    url: '/config/customer/contact/list-all-simple',
    method: 'get'
  })
}
