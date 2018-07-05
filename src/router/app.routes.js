import Home from '@/components/Home'

export default [{
  path: '/',
  name: 'Home',
  component: Home
}, {
  path: '*',
  redirect: '/'
}]
