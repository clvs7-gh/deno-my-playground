log('init');
var i = 0;
var result = [];
for (i = 0; i < 10; ++i) {
    result.push(i*i);
}
log('sample', 100, ['A', 'B']);
sleep(1000);
test(result.join(', '));
log('finish');

