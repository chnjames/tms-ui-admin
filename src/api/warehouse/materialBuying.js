import request from '@/utils/request'

// 获得物料采购均价
export function getMaterialBuyingAvgPrice(query) {
  return request({
    url: '/warehouse/material-buying/new/list',
    method: 'get',
    params: query
  })
}
// 创建物料采购
export function createMaterialBuying(data) {
  return request({
    url: '/warehouse/material-buying/create',
    method: 'post',
    data
  })
}
// 上传合同
export function uploadContract(data) {
  return request({
    url: '/warehouse/material-buying/contract/upload',
    method: 'post',
    data
  })
}
// 删除物料采购
export function deleteMaterialBuying(ids) {
  return request({
    url: '/warehouse/material-buying/delete?id=' + ids,
    method: 'delete'
  })
}
// 获得物料采购
export function getPurchase(query) {
  return request({
    url: '/warehouse/material-buying/get',
    method: 'get',
    params: query
  })
}
// 获得物料采购分页
export function getPurchasePage(query) {
  return request({
    url: '/warehouse/material-buying/page',
    method: 'get',
    params: query
  })
}
// 更新物料采购
export function updateMaterialBuying(data) {
  return request({
    url: '/warehouse/material-buying/update',
    method: 'put',
    data
  })
}
