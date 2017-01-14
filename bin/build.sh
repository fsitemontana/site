git clone https://fsitemontana:$PSW@github.com/fsitemontana/fsitemontana.github.io.git cdn

npm install -g yarn
yarn
gulp build

cd cdn
git add -A
git commit -m "update"
git push
