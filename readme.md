[元ドキュメント](http://qiita.com/atusi/items/dd10bc926aad1c676d07 "")


GASで作るSlack bot for github
SlackからGithub Issue新規作成するよ。GASで！

# シチュエーション
Slackでプロジェクトの相談とかしてる時に、アレやろうコレやろうとか
うぉ、Bug踏んだ！とか、日常茶飯事ですよね。

そんな会話してたくせに全然Issueを起こしてなくて、さっきなんか重要なタスク話してたよね？なんだっけ？凄い大切だった気がする！！みたいな感じ有りますよね。
そこから、ログをあさったりするわけですよ。んで見つけられないんですよ大抵の場合。

マメな人なら、その瞬間にIssue作るんだろうけど、マメな人なんて存在しないから
Issueが無いままドッカーンってナルわけですよ。ならないか？

# Slack から投稿すればいいやん

Slack(slash cmd) > GAS > githubAPI ということですね。

## 作業は3ステップ

### Step1
githubからパーソナルアクセストークンゲットする。
＞本来であればちゃんとOAuthでやるべき

### Step2
GASファイルを作成して、Webサービスを起動する。

### Step3
SlackにSlash Commandを登録する。

## Step1 パーソナルアクセストークン持ってくる

[Personal access tokens ページ](https://github.com/settings/tokens "") 
ここから、げねれーとしてくだしい

## Step2 GAS ファイルこさえる
[新規スクリプトファイル作って](https://script.google.com "")下のコードコピペして
config書き換える。

```コード.gs
// config
var ACC_TOKEN = "<Your Personal access tokens>";
var OWNER = "<ORGANISATION>";
var REPO = "<REPOSITORY>";


function sendHttpPost(issue_data) {  
  var raw_payload = {
    "title": issue_data.title, 
    "body" : issue_data.body +"\n\nwritten by "+ issue_data.owner
  }

  var payload = JSON.stringify(raw_payload);
      
  var options =
      {
        "method" : "POST",
        "payload" : payload
      };
  
  var x = UrlFetchApp.fetch("https://api.github.com/repos/"+OWNER+"/"+REPO+"/issues?access_token="+ACC_TOKEN, options);
  return '{"thank you"}'
}


function makeResponse(e, type){
  var s  = JSON.stringify({type: type, params: e});
  Logger.log(s);
  
  var ret = e.parameter.text.split(" ")
  var ret_hash = {
    "title": ret[0],
    "body":  ret[1],
    "owner": e.parameter.user_name
  }
                  
  return ret_hash
}

function doGet(e) {
  return sendHttpPost( makeResponse(e, "GET") );
}
function doPost(e) {
  return sendHttpPost( makeResponse(e,"POST") );
}
```

## Webアプリケーションとして導入する。

![SlackBot_github_newIssue.png](https://qiita-image-store.s3.amazonaws.com/0/4036/6be208d7-1211-b8ef-63fc-ead459eca46f.png "SlackBot_github_newIssue.png")

リビジョン打って、Webアプリとして公開する。
自分で実行で、全員（匿名ユーザーを含む）の設定にする。

![SlackBot_github_newIssue.png](https://qiita-image-store.s3.amazonaws.com/0/4036/8e57aaa8-f4d5-8928-ded1-884fedafba14.png "SlackBot_github_newIssue.png")


### 投稿者が固定されてしまう問題
上記スクリプトは、自分のアクセストークン仕込んでるせいで、Issueのオーナーが全件自分になってしまう。だれが投稿できたかがわかればいいので、本文の末尾に、Slackから取得できるUserNameを追記するようにした。

# Step3 SlackにSlashコマンドを仕込む


```
https://<YOUR_SLACK_TEAM>.slack.com/services/new/slash-commands
```
にアクセスし、新規コマンドを追加する。

Slashコマンドの設定項目は6箇所

- Command
  - `/.newissue`
- URL
  - 前ステップでコピーしたURL (*1)
- Method
  - GET (POSTでもどっちでもいいはず）
- Token
  - 今回使用していない。特にいじらず
- Autocomplete help text
  - Description
     -  `githubに新規イシューを作成します`
  - Usage hint
     - `[title] [body]`
- Desciptice Label
  - ` `(特に何も書いてない）

# 完成
以上で、Slackのどのチャンネルでも、`/.`と入力すれば
コマンドがサジェッションされ`/.newissue`にタイトルと本文を入れれば
イシューが作成されますよっと。

![Slack.png](https://qiita-image-store.s3.amazonaws.com/0/4036/094bf215-7c7d-b824-c1fe-7e1e2ca6999c.png "Slack.png")

補完が出るのでそのまま入力しちゃう

![Slack.png](https://qiita-image-store.s3.amazonaws.com/0/4036/c4ebfae4-7642-7d47-9f53-7b1756e49b58.png "Slack.png")


さらに、Slackのgithubインテグレーションを繋いでおくと投稿されたIssueがそのままSlackのチームに通知されます。

![Slack.png](https://qiita-image-store.s3.amazonaws.com/0/4036/924a809f-ce1a-b55f-04ab-4ed1e9cd24f8.png "Slack.png")

いい感じ！

## オプションパーサー募集 [github](https://github.com/a2chub/slack2githubIssue "リポジトリ")
引数で、リポジトリやマイルストン、アサイニーを設定したい。
必須フィールドにするのは、気軽にIssue作成のポリシーに反するので実装してない。
（＞パーサー書くのがめんどくさくてやってない）

例えばSlack上でつぶやくときの標準パターンとして

```slack_input
$ /.newissue [タイトル] [本文]
```

とするんだけども、明らかにオプションが指定できるときには、

```option
-r リポジトリー名
-m マイルストン名
-l ラベル名（複数可能）
-a アサイニー
```
等オプション指定が出来るようになるとよりIssueカオスが和らぎそう。

こんな感じにできたらなぁ・・😳

```slack_input_full_option
$ /.newissue -r myrepo2 -m 高速化 -l ログイン -a a2chub ログイン画面の画像をSVG化する ログインページの表示が重いので可能な限り早くする、取り急ぎ画像ファイルをSVGに置き換える
```

ミタイナ感じにできるといいなぁと・・・
[.gsファイルをgithubに上げてありますので、cmdパーサのprお待ちしておりますm(_ _)m](https://github.com/a2chub/slack2githubIssue "")


Happy Slacking!!




