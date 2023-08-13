import request from '@/utils/request'


// 获得盘点分页
export function getStocktakingPage(query) {
  return request({
    url: '/warehouse/stocktaking/list',
    method: 'get',
    params: query
  })
}
// 盘点
export function stocktakingExec(data) {
  return request({
    url: '/warehouse/stocktaking/exec',
    method: 'post',
    data: data
  })
}
