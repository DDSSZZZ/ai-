export const EVIDENCE = [
  {id:'ticket',name:'一张「内部票」',type:'图片档案',number:'01',tag:'看起来很真实',title:'落日回声 LIVE',subtitle:'2026 巡演 · 城市站',body:'VIP 看台 / B 区 06 排 18 座',note:'卖家发来的电子票样图',hotspot:'票面有座位、有条码，是否就能证明这张票属于卖家？',finding:'精美票面不等于出票凭证。图片可以被复制或修改，条码也不能证明卖家拥有可转让的门票。应从自己找到的官方票务入口核实订单与转让规则。',label:'票面不能证明所有权'},
  {id:'notice',name:'客服的「冻结通知」',type:'聊天附件',number:'02',tag:'是谁在证明谁',title:'订单资金冻结告知',subtitle:'票务保障服务中心',body:'需补缴 ¥800 认证金，以完成解冻。认证完成后原路返还。',note:'来源：卖家推荐的“专属客服”',hotspot:'卖家推荐的人，能作为核实卖家可信度的独立来源吗？',finding:'卖家与其推荐的“客服”可能属于同一骗局。要求转账认证、交钱解冻是明显风险信号。请退出这条联系链，通过自己找到的官方 App 或客服电话核实。',label:'客服来源不独立'},
  {id:'payment',name:'收款信息',type:'转账记录',number:'03',tag:'钱将流向哪里',title:'等待支付',subtitle:'剧情中的模拟付款单',body:'¥800.00',note:'收款方：个人账户「陈＊」 / 备注：认证金',hotspot:'对方自称平台客服，为什么让你向个人账户交认证金？',finding:'身份与收款主体不一致，且要求绕过平台交易，是需要停止操作并独立核实的信号。不能只凭头像、名称或对方发来的截图判断身份。',label:'平台身份与个人收款矛盾'}
];

export const SCENES = {
  wake: {chapter:'01',name:'不该出现的消息',time:'21:40',signal:'检测到时间偏移 +00:10:00',speaker:'十分钟后的你',avatar:'↗',kind:'future',messages:['先别付第二笔钱。','我知道你刚付了 199 元订金，也知道你一直想去那场演唱会。','十分钟后，你会后悔没多问一句。'],narration:'你看了一眼屏幕。消息的发送时间，竟然是 21:50。',choices:[{id:'ask',text:'你怎么证明，你就是我？',sub:'先质疑这条神秘消息',next:'seller',skill:'verify',feedback:'你没有因为对方知道细节就立刻相信。掌握个人信息，并不能证明身份。'},{id:'ignore',text:'可能是恶作剧，先看卖家消息',sub:'回到正在进行的交易',next:'seller',skill:'neutral',feedback:'切换对话本身不代表风险，关键在于接下来是否核实。'}]},
  seller: {chapter:'02',name:'最后一张票',time:'21:42',signal:'另一条消息接入',speaker:'小林 · 转票',avatar:'林',kind:'seller',messages:['票给你留好了，电子票图我发过去了。','平台刚提示订单需要认证，你加一下专属客服，处理完就出票。','后面还有人在等，你尽快呀。'],narration:'票面、座位号、客服头像，一切似乎都很完整。',attachment:'ticket',choices:[{id:'check',text:'先看看这些材料有没有问题',sub:'打开证据档案，自行判断',next:'freeze',skill:'observe',feedback:'你开始检查证据，而不是仅凭完整的包装建立信任。',openEvidence:true},{id:'follow',text:'先听听客服怎么说',sub:'进入卖家提供的联系渠道',next:'freeze',skill:'neutral',feedback:'可以了解对方说法，但卖家推荐的客服不能成为独立核实来源。'}]},
  freeze: {chapter:'03',name:'会退回来的钱',time:'21:45',signal:'未来信号再次出现',speaker:'票务保障 · 客服',avatar:'客',kind:'seller',messages:['您好，您的订单由于首次交易触发资金冻结。','现在支付 800 元认证金即可解冻，认证完成后会原路返还。','请在 3 分钟内完成，否则订金不予保留。'],narration:'“只是暂时垫一下。” 你发现自己已经开始这样想。',attachment:'notice',future:'我当时也这么想：已经付了 199，总不能白花。但第一笔钱，不是再付一笔的理由。',choices:[{id:'official',text:'退出对话，自己查找官方客服',sub:'通过独立渠道核实这项要求',next:'verified',skill:'verify',feedback:'你切断了卖家与假客服相互证明的链条，选择独立核实。'},{id:'challenge',text:'让客服再出示一些证明',sub:'继续在当前对话中询问',next:'pressure',skill:'observe',feedback:'多问有帮助，但同一来源可以继续提供虚假材料。还需要独立渠道。'},{id:'prepare',text:'先看看付款信息',sub:'仅查看模拟信息，不会真实付款',next:'pressure',skill:'neutral',feedback:'查看信息不等于付款。发现异常后，仍可以随时停下来。',openPayment:true}]},
  pressure: {chapter:'04',name:'被催促的决定',time:'21:47',signal:'信号不稳定 / 请保持连接',speaker:'票务保障 · 客服',avatar:'客',kind:'seller',messages:['认证流程都是一样的，我的工作证也可以发给您。','收款账户是工作人员代收，不影响退款。','再不操作，系统就自动关闭订单了。'],narration:'屏幕另一端不断催促。可真正需要你赶时间的，究竟是谁？',attachment:'payment',future:'别把“他又发了一张证明”，当成“你核实了一次”。退出去，用你自己找到的渠道。',choices:[{id:'independent',text:'暂停，转去官方渠道核实',sub:'不使用对方提供的链接或电话',next:'verified',skill:'verify',feedback:'你把核实来源换成了独立渠道，打断了催促节奏。'},{id:'stop',text:'不再付款，保存记录并求助',sub:'停止追加投入，处理已有损失',ending:'stop',skill:'stop',feedback:'你停止了继续投入，并保留了处理已有损失所需的证据。'},{id:'pay',text:'相信这一次，支付认证金',sub:'推进虚构剧情，无真实转账',ending:'loss',skill:'risk',feedback:'“能退还”只是对方的承诺。追加付款不会让一笔可疑交易变得可靠。'}]},
  verified: {chapter:'05',name:'另一端的真相',time:'21:48',signal:'时间线正在改变',speaker:'官方帮助中心',avatar:'✓',kind:'official',messages:['你关闭了聊天，从自己找到的官方票务 App 进入帮助中心。','核实结果：本故事中的官方平台没有“转账认证金解冻”流程。','卖家发来的票面图片，也不能证明有可转让的真实订单。'],narration:'那些看起来互相印证的材料，原来都来自同一条联系链。',future:'这一次，你走到了我没走到的地方。现在，替我们把最后一步做好。',choices:[{id:'report',text:'停止转账，保存证据并举报',sub:'已有损失，及时联系银行并报警',ending:'safe',skill:'protect',feedback:'你完成了独立核实，并采取停止转账、保存证据、寻求帮助的行动。'},{id:'refund',text:'回去要求卖家退款，不付其他费用',sub:'保留记录，同时准备向平台求助',ending:'stop',skill:'stop',feedback:'可以要求退款，但不要为退款再付解冻费、保证金等费用；不要因此耽误报警和联系银行。'}]}
};

export const ENDINGS = {
 safe:{label:'结局 01 / 改写未来',title:'这次，未来变了。',subtitle:'你没有让一个人的谎言，变成第二个人的证明。',color:'green',message:'你通过独立渠道核实，避开了后续 800 元的模拟损失。故事里已付的 199 元仍需保留记录、及时求助；追回结果不能保证。'},
 stop:{label:'结局 02 / 及时停下',title:'停下来，也是一种答案。',subtitle:'已经付出的代价，不需要用更大的代价证明。',color:'green',message:'你停止了追加付款，避免扩大损失。下一步是独立核实、保留记录，并处理故事里已付的 199 元订金。'},
 loss:{label:'结局 03 / 重启时间线',title:'你还有一次重来的机会。',subtitle:'在这里，代价只是一次模拟。',color:'pink',message:'剧情中的累计损失变为 999 元。对方随后又提出新的缴费理由。现实里不要继续补款，也不要相信收费追款；及时联系银行和警方。'}
};

export function endingFor(id){return ENDINGS[id] || ENDINGS.stop;}
export function offlineHint(question,sceneId){
 if(/(转账|付钱|认证|解冻|退款|800)/.test(question)) return '先停止转账。“先交钱才能解冻或退款”是明显风险信号。你可以关闭当前对话，从自己找到的官方 App 核实是否存在这项流程。已经付了钱，也不意味着必须继续付。';
 if(/(报警|被骗|损失|求助)/.test(question)) return '如果已经遭受损失：停止转账，保存聊天、账户和交易记录，及时联系银行或支付平台并拨打 110 报警。96110 主要用于反诈预警劝阻和咨询，不替代紧急报警。不要向所谓“追款人员”付费。';
 if(/(证据|票|截图|条码)/.test(question)) return '一张完整的票面图片，能证明“图片存在”，却不能单独证明卖家拥有这张票。打开证据档案，想一想：来源是谁？有没有独立的核实方式？';
 if(/(你是谁|未来|相信)/.test(question)) return '连“未来的你”也值得被核实。知道你的订金或个人细节，并不自动证明身份。把关键决定建立在独立可验证的信息上。';
 return sceneId==='wake' ? '先留意一个问题：知道你刚刚做过什么，就能证明对方可信了吗？读完消息，再做出你自己的选择。' : '试着把问题拆成三句：对方是谁？他要我做什么？能不能离开他提供的渠道独立核实？右侧的证据档案里也许有你需要的线索。';
}

export function validateState(value){
 if(!value || value.version!==1 || !SCENES[value.scene] || !Array.isArray(value.history) || !Array.isArray(value.evidence)) return null;
 if(value.ending!==null && !ENDINGS[value.ending]) return null;
 let current='wake', ending=null;
 for(const row of value.history){
   if(ending || row.scene!==current) return null;
   const choice=SCENES[current].choices.find(c=>c.id===row.choice);
   if(!choice) return null;
   if(choice.ending) ending=choice.ending; else current=choice.next;
 }
 if(current!==value.scene || ending!==value.ending) return null;
 return {version:1,scene:current,ending,history:value.history.map(r=>({scene:r.scene,choice:r.choice})),evidence:[...new Set(value.evidence.filter(id=>EVIDENCE.some(e=>e.id===id)))],started:true};
}

