import request from '@/utils/request'

// 获得出入库记录分页
export function getStockRecordPage(query) {
  return request({
    url: '/warehouse/stock-record/page',
    method: 'get',
    params: query
  })
}
