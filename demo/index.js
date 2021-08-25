import main from 'demo/main'

export default {
  pubBaseUrl: '/',
  pubRule: {
    getAll: {
      type: 'get',
      path: '/app/put/getAll'
    }
  },
  children: {
    main
  }
}
