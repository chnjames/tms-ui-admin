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
