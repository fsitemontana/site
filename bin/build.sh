git clone https://fsitemontana:$PSW@github.com/fsitemontana/fsitemontana.github.io.git cdn

npm install -g yarn
yarn
gulp build

cd cdn

git config --global user.email "inkommsite@abv.bg"
git config --global user.name "Inkomm site"

git add -A
git commit -m "update"
git push
