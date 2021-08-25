export default {
  baseUrl: '/',
  rule: {
    getKey: {
      path: '/app/main/getKey',
      type: 'GET'
    },
    user: {
      path: '/app/main/user',
      type: 'AUTO'
    },
    pubKKS: {
      target: 'getAll'
    }
  },
  children: {}
}
