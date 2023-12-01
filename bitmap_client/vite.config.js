import {fileURLToPath, URL} from 'node:url'
import {defineConfig, loadEnv} from 'vite'
import vue from '@vitejs/plugin-vue'


export default defineConfig(({mode, command}) => {
    return {
        base: './',
        define: {
            'process.env': process.env
        },
        envPrefix: "VUE_APP_",//APP_  为自定义开头名
        plugins: [
            vue(),
        ],
        resolve: {
            alias: {
                '@': fileURLToPath(new URL('./src', import.meta.url))
            }
        }
    }
});


// https://vitejs.dev/config/
// export default defineConfig({
//   base: './',
//   define:{
//     // 'process.env':{}
//   },
//   envPrefix:"VUE_APP_",//APP_  为自定义开头名
//   plugins: [
//     vue(),
//   ],
//   resolve: {
//     alias: {
//       '@': fileURLToPath(new URL('./src', import.meta.url))
//     }
//   }
// })
