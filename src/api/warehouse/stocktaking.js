import request from '@/utils/request'


// 获得盘点分页
export function getStocktakingPage(query) {
  return request({
    url: '/warehouse/stocktaking/list',
    method: 'get',
    params: query
  })
}
