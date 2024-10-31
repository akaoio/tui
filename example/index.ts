const { initLip, Lipgloss } =  require("../dist/");

// newStyle("I am a long string I should turn out purple I think", "myid")
// canvasColor("#7D56F4", 1)
// // l.styles[*style].Padding(top, right, bottom, left)
// // padding(0, 0, 0, 100)
// margin(0, 0, 0, 10)
// // place(100, 10, "right", "bottom", "myid")  //block := lipgloss.Place(h, w, hpos, vpos, el)


// newStyle("I am another string", "myid2")
// canvasColor("#7D56F4", 1)
// // padding(10, 20, 40, 50)
// // margin(10, 10, 10, 10)
// // place(100, 10, "right", "bottom", "myid")  //block := lipgloss.Place(h, w, hpos, vpos, el)
// const id = JoinHorizontal("bottom", "myid2", "myid")
// // console.log(id)

// newStyle("Another style hey I don't know what to write", "myid3")
// canvasColor("126", 1)

// // JoinVertical("center",  "myid3", id)

// const id2 =  JoinVertical("bottom", id,   "myid3")
//  console.log(id2)
// newStyle("Hello World", "myid4")
// canvasColor("127", 1)
// // margin(10, 0, 0, 10)

// JoinHorizontal("bottom", "myid4", id2)





(async function () {
  await initLip()

  console.log("tf")
  const lip = new Lipgloss()
  console.log(lip)

  lip.createStyle({
    id: "primary",
    canvasColor: { color: "#7D56F4"},
    border: { type: "rounded", background: "#0056b3", sides: [true] },
    padding: [6, 8, 6, 8],
    margin: [0, 0, 8, 0],
    bold: true,
    align: 'center',
    width: 10,
    height: 12,

  });

  lip.createStyle({
    id: "secondary",
  canvasColor: {color: "#7D56F4" },
  border: { type: "rounded", background: "#0056b3", sides: [true, false] },
  padding: [6, 8, 6, 8],
   margin: [0, 0, 8, 0],
    bold: true,
   align: "center",
   width: 10, 
   height: 12,

  });


  const a = lip.apply({value: "Charsmmm", id: "secondary"})
  // console.log(a)
  const b = lip.apply({value: 'Charsmmm', id: "primary"})
  const c = lip.apply({value: "🔥🦾🍕", id: "secondary"})


    const res = lip.join({direction: "horizontal", elements: [a, b, c], position: "left"})
    console.log(res)
    
  //     lip.newStyle("I am a text", "text1")
  //     .canvasColor("#7D56F4", 1)
  //     .border("thick", true, true, false, false, "216")
  //     .margin(10, 10, 10, 10)


  //     lip.newStyle("I am text 2", "text2")
  //     .canvasColor("#7D56F4", 1)


  //     const id =  lip.JoinHorizontal("bottom", "text1", "text2")

  //    lip.newStyle("Another style hey I don't know what to write", "myid3")
  //    .canvasColor("126", 1)
  //    .border("rounded", true, false);

  //    if(!id)
  //       return 

  // const id2 = lip.JoinVertical("bottom", id, "myid3" )

  //   lip.newStyle("Hello World", "myid4").
  //   canvasColor("127", 1)
  //   .border("rounded", true).width(22);

  //   if(!id2)
  //     return

  //   lip.JoinHorizontal('bottom', "myid4", id2)


  //   lip.render()

})()
