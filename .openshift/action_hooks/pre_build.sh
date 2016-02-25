sed -i '/product_extension/d' ~/app-root/runtime/repo/node_modules/node-rss/node_modules/libxmljs/binding.gyp

sed -i '/shared_library/d' ~/app-root/runtime/repo/node_modules/node-rss/node_modules/libxmljs/binding.gyp

sed -i '375 c#if 0' 
cd ~/app-root/runtime/repo/node_modules/node-rss/node_modules/libxmljs
node-gyp rebuild