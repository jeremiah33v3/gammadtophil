import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import PDFDocument from 'pdfkit'

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')
const ASSETS = path.join(ROOT, 'src', 'assets')
const creamStock = process.argv.includes('--cream-stock')
const OUTPUT = path.join(ROOT, creamStock ? 'missionary-packet-cream-stock.pdf' : 'missionary-packet-draft.pdf')

const files = {
  logo: 'Gammad_to_the_Philippines_Logo_Transparent.png',
  icon: 'Gammad_Icon_Transparent.png',
  coverFamily: 'gammad-family.jpeg',
  family: 'Family Picture 2.JPG',
  holyWeek: 'holyweek-pilgrims-to-antipolo cathedral.jpg',
  nazarene: 'black nazarene 2.jpg',
  reach: 'preaching at garment factory.JPG',
  plant: 'Sharing the Gospel in the Sta Maria.jpg',
  disciple: 'door to door soul winning.JPG',
  train: 'preaching at youth fellowship.JPG',
}

const image = (name) => path.join(ASSETS, name)
const colors = {
  navy: '#06294b',
  ink: '#0a2748',
  gold: '#b87818',
  cream: '#f8f0e3',
  paper: '#fffaf1',
  line: '#d8b36d',
  muted: '#53687d',
  white: '#ffffff',
}

const PAGE_W = 612
const PAGE_H = 792
const LEFT = 55
const RIGHT = 557
const CONTENT_W = RIGHT - LEFT
const BODY_BOTTOM = 737

const FONT_PATH = '/usr/share/fonts/truetype/dejavu'
const fontPaths = {
  Body: path.join(FONT_PATH, 'DejaVuSans.ttf'),
  BodyBold: path.join(FONT_PATH, 'DejaVuSans-Bold.ttf'),
  Serif: path.join(FONT_PATH, 'DejaVuSerif.ttf'),
  SerifBold: path.join(FONT_PATH, 'DejaVuSerif-Bold.ttf'),
  Mono: path.join(FONT_PATH, 'DejaVuSansMono.ttf'),
}

for (const file of [...Object.values(files).map(image), ...Object.values(fontPaths)]) {
  if (!fs.existsSync(file)) throw new Error(`Required packet asset was not found: ${file}`)
}

const doc = new PDFDocument({
  size: 'LETTER',
  margins: 0,
  autoFirstPage: false,
  bufferPages: true,
  info: {
    Title: 'The Gammad Family — Missionary Packet',
    Author: 'The Gammad Family',
    Subject: 'Missionaries to the Philippines',
    Creator: 'Gammad Family missionary packet draft',
  },
})

for (const [name, file] of Object.entries(fontPaths)) doc.registerFont(name, file)

let pageNumber = 0
doc.on('pageAdded', () => {
  pageNumber += 1
  doc.save()
  if (!creamStock) doc.rect(0, 0, PAGE_W, PAGE_H).fill(colors.paper)

  doc.image(image(files.icon), 42, 19, { width: 31, height: 31 })
  doc.font('BodyBold').fontSize(8.2).fillColor(colors.navy)
    .text('GAMMAD TO THE PHILIPPINES', 83, 25, { characterSpacing: 1.1 })
  doc.font('Mono').fontSize(6.9).fillColor(colors.gold)
    .text('MISSIONARY PACKET', 83, 38, { characterSpacing: 0.6 })
  doc.font('Mono').fontSize(6.8).fillColor(colors.muted)
    .text('FOR THE HARVEST', 413, 30, { width: 154, align: 'right', characterSpacing: 0.55 })
  doc.moveTo(42, 63).lineTo(570, 63).lineWidth(0.8).strokeColor(colors.line).stroke()
  doc.moveTo(42, 751).lineTo(570, 751).lineWidth(0.55).strokeColor(colors.line).stroke()
  doc.font('Mono').fontSize(7).fillColor(colors.muted)
    .text('THE GAMMAD FAMILY  •  MISSIONARIES TO THE PHILIPPINES', 43, 760, { characterSpacing: 0.25 })
  doc.font('Mono').fontSize(7.2).fillColor(colors.navy)
    .text(String(pageNumber).padStart(2, '0'), 539, 759, { width: 29, align: 'right' })
  doc.restore()
})

function addPage() {
  doc.addPage({ size: 'LETTER', margins: 0 })
}

function pageTitle(kicker, title, options = {}) {
  const x = options.x ?? LEFT
  const y = options.y ?? 85
  const width = options.width ?? CONTENT_W
  const size = options.size ?? 26
  doc.font('Mono').fontSize(7.8).fillColor(colors.gold)
    .text(kicker.toUpperCase(), x, y, { width, characterSpacing: 1.15 })
  doc.font('SerifBold').fontSize(size).fillColor(colors.navy)
  const titleY = y + 16
  const titleHeight = doc.heightOfString(title, { width, lineGap: 1 })
  doc.text(title, x, titleY, { width, lineGap: 1 })
  return Math.max(y + (options.after ?? 59), titleY + titleHeight + (options.tailGap ?? 12))
}

function paragraph(text, x, y, width, options = {}) {
  const font = options.font ?? 'Body'
  const size = options.size ?? 10.5
  const lineGap = options.lineGap ?? 3.1
  const after = options.after ?? 8
  const color = options.color ?? colors.ink

  doc.font(font).fontSize(size)
  const height = doc.heightOfString(text, { width, lineGap, align: options.align ?? 'left' })
  doc.fillColor(color).text(text, x, y, {
    width,
    lineGap,
    align: options.align ?? 'left',
    link: options.link,
  })
  return y + height + after
}

function imageContain(file, x, y, width, height) {
  const item = doc.openImage(file)
  const scale = Math.min(width / item.width, height / item.height)
  const drawWidth = item.width * scale
  const drawHeight = item.height * scale
  doc.image(file, x + (width - drawWidth) / 2, y + (height - drawHeight) / 2, {
    width: drawWidth,
    height: drawHeight,
  })
}

function imageCover(file, x, y, width, height, options = {}) {
  const item = doc.openImage(file)
  const scale = Math.max(width / item.width, height / item.height)
  const drawWidth = item.width * scale
  const drawHeight = item.height * scale
  const offsetX = options.offsetX ?? 0.5
  const offsetY = options.offsetY ?? 0.5
  const drawX = x + (width - drawWidth) * offsetX
  const drawY = y + (height - drawHeight) * offsetY
  doc.save()
  doc.rect(x, y, width, height).clip()
  doc.image(file, drawX, drawY, { width: drawWidth, height: drawHeight })
  doc.restore()
}

function caption(text, x, y, width, options = {}) {
  doc.font('Mono').fontSize(options.size ?? 6.8).fillColor(options.color ?? colors.navy)
    .text(text.toUpperCase(), x, y, { width, align: options.align ?? 'left', characterSpacing: 0.65 })
}

function checkBottom(label, y) {
  if (y > BODY_BOTTOM) throw new Error(`${label} extends beyond its page (content ends at y=${Math.round(y)}).`)
}

// Cover
addPage()
doc.roundedRect(58, 78, 496, 270, 4).fill(colors.white)
imageContain(image(files.logo), 75, 88, 462, 250)
doc.save()
doc.roundedRect(71, 355, 470, 285, 4).clip()
imageCover(image(files.coverFamily), 71, 355, 470, 285, { offsetY: 0 })
doc.restore()
doc.roundedRect(71, 355, 470, 285, 4).lineWidth(1.4).strokeColor(colors.line).stroke()
doc.font('SerifBold').fontSize(29).fillColor(colors.navy)
  .text('For the harvest.', 76, 653, { width: 460, align: 'center' })
doc.font('BodyBold').fontSize(10.4).fillColor(colors.gold)
  .text('ROMMEL  •  SHIELA  •  RYLE GAMMAD', 76, 695, { width: 460, align: 'center', characterSpacing: 1.1 })
doc.font('Body').fontSize(9.1).fillColor(colors.ink)
  .text('Missionaries to the Philippines', 76, 713, { width: 460, align: 'center' })

// Family introduction
addPage()
let y = pageTitle('Our family', 'Saved by grace. Sent in faith.')
const familyPhotoX = 326
const familyPhotoY = 160
doc.roundedRect(familyPhotoX - 5, familyPhotoY - 5, 235, 355, 3).fill(colors.white)
imageCover(image(files.family), familyPhotoX, familyPhotoY, 225, 345, { offsetY: 0.35 })
doc.roundedRect(familyPhotoX, familyPhotoY, 225, 345, 2).lineWidth(1).strokeColor(colors.line).stroke()
caption('The Gammad family', familyPhotoX, 514, 225, { align: 'center' })

const familyIntro = [
  'We are the Gammad family from Elgin, Illinois. God saved us by His grace and has led us to surrender our lives to serve Him full-time as missionaries to the Philippines.',
  'Our burden is for people to hear the true Gospel, grow as faithful disciples of Christ, and become part of independent, fundamental, and Bible-believing Baptist churches.',
]
for (const text of familyIntro) y = paragraph(text, LEFT, y, 245, { size: 11, lineGap: 4, after: 13, font: 'Serif' })

doc.roundedRect(LEFT, y + 4, 245, 110, 3).fill(colors.navy)
doc.font('Mono').fontSize(7.2).fillColor('#f4ca74')
  .text('OUR FOUNDATION', LEFT + 15, y + 19, { characterSpacing: 1 })
paragraph('Jesus Christ alone saves, and God’s Word is the final authority for faith and life.', LEFT + 15, y + 39, 215, {
  font: 'Serif', size: 11.2, lineGap: 3.5, after: 0, color: colors.white,
})

doc.font('Serif').fontSize(11.5).fillColor(colors.muted)
  .text('“The harvest truly is plenteous, but the labourers are few.”', LEFT, 595, { width: CONTENT_W, align: 'center' })
doc.font('Mono').fontSize(7.4).fillColor(colors.gold)
  .text('MATTHEW 9:37–38', LEFT, 619, { width: CONTENT_W, align: 'center', characterSpacing: 1.05 })

// Rommel's testimony
addPage()
y = pageTitle('Personal testimony', 'Rommel’s salvation testimony')
const rommelStory = [
  'I grew up in a Catholic family. At a young age, I simply followed the religion of my parents. I served as an altar boy and was active in the Catholic youth group. I even participated in religious ceremonies, including carrying a cross in an Easter procession, believing that these religious activities could somehow help me get to heaven.',
  'My eldest sister was the first in our family to be saved. I attended Baptist church services and heard the Gospel while I was in high school, but I never truly understood what it meant to be saved.',
  'During college and the years that followed, I developed sinful habits and a worldly lifestyle, but after losing my father, God began to soften my heart and draw me to Himself.',
  'One day, God used a daily devotional about salvation to show me my true spiritual condition. I realized that I was a sinner and that my religion, good works, and religious activities could never save me. I needed Jesus Christ.',
  'In 2004, one morning while sitting at my desk in the office, I bowed my head and asked God to save me. I placed my faith in Jesus Christ and trusted Him alone for my salvation.',
]
y += 4
for (const text of rommelStory) y = paragraph(text, LEFT, y, CONTENT_W, { size: 10.7, lineGap: 3.5, after: 9 })
doc.roundedRect(LEFT, y + 3, CONTENT_W, 55, 3).fill(colors.cream)
doc.font('Serif').fontSize(11).fillColor(colors.navy)
  .text('“For by grace are ye saved through faith; and that not of yourselves; it is the gift of God.”', LEFT + 13, y + 14, { width: CONTENT_W - 26, align: 'center' })
doc.font('Mono').fontSize(7.2).fillColor(colors.gold)
  .text('EPHESIANS 2:8', LEFT + 13, y + 39, { width: CONTENT_W - 26, align: 'center', characterSpacing: 0.9 })
checkBottom('Rommel’s testimony', y + 62)

// Shiela's testimony
addPage()
y = pageTitle('Personal testimony', 'Shiela’s salvation testimony')
const shielaStory = [
  'I am thankful for a coworker who eventually became a good friend of mine. She faithfully invited me to church many times, but because I grew up in a Catholic background, I always found reasons not to go.',
  'One day, she invited me to attend a youth camp. As a young lady who loved the outdoors, I was finally convinced to go.',
  'I still remember the preaching at that camp. The message was about hell, and it caused me to seriously consider where I would spend eternity. During an invitation at that youth camp, a lady sat down with me and showed me from the Bible how I could be saved. In June of 1998, I accepted Jesus Christ as my personal Saviour.',
  'Although I had trusted Christ, I did not immediately grow in my faith. Then, on November 28, 2004, God helped me gain assurance of my salvation. I followed the Lord in baptism and began faithfully attending a Bible-believing Baptist church, where I started growing in my relationship with the Lord.',
  'I am especially thankful that God used the persistence and faithfulness of a friend who never stopped inviting me to church.',
]
for (const text of shielaStory) y = paragraph(text, LEFT, y, CONTENT_W, { size: 11, lineGap: 4, after: 12, font: 'Serif' })
doc.roundedRect(LEFT, y + 7, CONTENT_W, 66, 3).fill(colors.cream)
doc.font('SerifBold').fontSize(12).fillColor(colors.navy)
  .text('A faithful invitation can change a life.', LEFT + 14, y + 19, { width: CONTENT_W - 28, align: 'center' })
doc.font('Mono').fontSize(7.2).fillColor(colors.gold)
  .text('SAVED BY GRACE  •  GROWING IN CHRIST', LEFT + 14, y + 44, { width: CONTENT_W - 28, align: 'center', characterSpacing: 0.85 })
checkBottom('Shiela’s testimony', y + 82)

// Ryle's testimony
addPage()
y = pageTitle('Personal testimony', 'Ryle’s salvation testimony')
const ryleStory = [
  'When I was six years old, I remember hearing about salvation, but I never really knew what it meant. Coming home from church one night, I asked my dad what it meant to be saved. He took me through the Gospel, and I made a profession of faith that day.',
  'Coming to Northwest Bible Baptist Church was a big change for me. I had never felt conviction in my life before, so I doubted my salvation. All the way up until 2022, I felt fear and insecurity about where I would go when I died.',
  'At football camp in August 2022, Bro. Nichols preached a powerful message on hell. It was not until Thursday night of that week that God moved in my heart and I went forward for assurance. Bro. Jeremy Huston dealt with me, and I gained assurance of my salvation. I have never doubted it since that day.',
]
for (const text of ryleStory) y = paragraph(text, LEFT, y, CONTENT_W, { size: 10.7, lineGap: 3.5, after: 9 })
checkBottom('Ryle’s testimony', y)

// Calling story and timeline
addPage()
y = pageTitle('God’s call on our lives', 'Every step prepared the way forward.', { size: 23 })
const timelineTop = y + 7
doc.font('Mono').fontSize(7.1).fillColor(colors.gold)
  .text('A TIMELINE OF GOD’S PREPARATION', LEFT, timelineTop, { characterSpacing: 0.9 })
const timeline = [
  ['2004', 'Rommel saved by God’s grace'],
  ['2019', 'Joined Northwest Bible Baptist Church'],
  ['2020', 'God renewed a burden for ministry'],
  ['2025', 'Ministry training at Providence Baptist College'],
  ['2026', 'Surrendered to full-time missions'],
]
const timelineX = LEFT + 13
const timelineW = CONTENT_W - 26
const gap = timelineW / (timeline.length - 1)
doc.moveTo(timelineX, timelineTop + 27).lineTo(timelineX + timelineW, timelineTop + 27).lineWidth(1.4).strokeColor(colors.line).stroke()
timeline.forEach(([year, label], index) => {
  const center = timelineX + gap * index
  doc.circle(center, timelineTop + 27, 5).fill(colors.gold)
  doc.font('Mono').fontSize(8.2).fillColor(colors.navy)
    .text(year, center - 40, timelineTop + 40, { width: 80, align: 'center' })
  doc.font('Body').fontSize(7.1).fillColor(colors.muted)
    .text(label, center - 44, timelineTop + 56, { width: 88, align: 'center', lineGap: 2.4 })
})

const callingStory = [
  'In 2005, I enrolled in Bible college but was unable to finish my first semester when God opened the door for me to move to the United States. In 2006, Shiela and I got married. For the next thirteen years, we were members of a Baptist church in Schaumburg, Illinois, where I taught a Filipino Sunday School class and served as a deacon.',
  'In 2019, my family and I began attending Northwest Bible Baptist Church. In the following year, while attending the Providence Baptist College graduation, God renewed my burden for ministry. When Dr. Keith Gomez said, “There is something about finishing what you started,” those words deeply convicted me.',
  'Over the next few years, God continued preparing my heart. We faithfully participated in soul winning, discipleship, and other ministries in our church. Through missions conferences, conversations with missionaries, and summer trips to the Philippines, my desire for ministry became stronger.',
  'With my pastor’s encouragement and God’s provision, I enrolled in Providence Baptist College in January 2025 to pursue a Master’s degree in Biblical Studies. I began teaching a Tagalog Sunday School class and preaching regularly in our nursing home ministry.',
  'As I balanced work, school, family, and ministry, I began earnestly praying that God would clearly show me His will concerning full-time ministry.',
  'For twenty-five years, I had built a good career and enjoyed financial security. In January 2026, God brought the story of Abraham in Genesis 12 to my heart. I came to realize that following God’s will would require me to trust Him beyond what was comfortable and secure.',
  'That same month, my company announced a departmental restructuring. I saw this as God’s answer to my prayers and an open door to follow His will, so I volunteered for the workforce reduction and surrendered to full-time missions.',
]
let callY = timelineTop + 107
for (const text of callingStory) callY = paragraph(text, LEFT, callY, CONTENT_W, { size: 10.7, lineGap: 2.5, after: 5.4 })
checkBottom('God’s calling story', callY)

// Why the Philippines?
addPage()
y = pageTitle('The field before us', 'Why the Philippines?')
const philippinesStory = [
  'In the summers of 2024 and 2025, our family visited the Philippines. During those trips, I had opportunities to share the Gospel with old friends and acquaintances, factory workers, police officers, hospital workers, and many others. I witnessed God working in hearts and saw a genuine hunger among Filipinos for the truth of His Word. God used these experiences to open my eyes to the great need for laborers and renewed my desire to serve Him full-time.',
  'The Philippines is home to more than 117 million people. It is a deeply religious nation, yet many are deeply rooted in a false gospel of works-based salvation rather than faith in Jesus Christ alone.',
  'According to the 2020 Census, 78.8 percent identified as Roman Catholic, 6.4 percent as Muslim, 4.8% as Evangelical, and 2.6% as Iglesia ni Cristo, while Bible Baptist Church accounted for only 0.5%. There are millions of people who still need to hear the Gospel.',
  'God has used faithful American missionaries and raised up many Filipino Baptist preachers and missionaries. We believe there remains a tremendous need for independent, fundamental Baptist churches that faithfully proclaim the Gospel, stand firmly on the authority of Scripture, actively engage in soul winning, and carry out the Great Commission.',
]
for (const text of philippinesStory) y = paragraph(text, LEFT, y, CONTENT_W, { size: 10.7, lineGap: 2.6, after: 6 })

const photoTop = Math.max(y + 4, 530)
const fieldPhotoW = 244
const fieldPhotoH = 151
imageCover(image(files.holyWeek), LEFT, photoTop, fieldPhotoW, fieldPhotoH)
imageCover(image(files.nazarene), LEFT + fieldPhotoW + 14, photoTop, fieldPhotoW, fieldPhotoH, { offsetX: 0.53 })
caption('A deeply religious nation • Antipolo', LEFT, photoTop + fieldPhotoH + 8, fieldPhotoW)
caption('A nation longing for truth • Quiapo', LEFT + fieldPhotoW + 14, photoTop + fieldPhotoH + 8, fieldPhotoW)
checkBottom('Why the Philippines photos', photoTop + fieldPhotoH + 22)

// Ministry vision
addPage()
y = pageTitle('Our ministry vision', 'Reach. Plant. Disciple. Train.')
const visionIntro = 'A Gospel-centered ministry that reaches people, establishes churches, and prepares faithful workers.'
doc.font('Body').fontSize(10.7).fillColor(colors.muted)
const visionIntroY = y - 1
const visionIntroHeight = doc.heightOfString(visionIntro, { width: CONTENT_W, lineGap: 2 })
doc.text(visionIntro, LEFT, visionIntroY, { width: CONTENT_W, lineGap: 2 })

const visionCards = [
  { number: '01', title: 'Reach', text: 'Proclaim the Gospel through soul winning, preaching, and outreach.', file: files.reach },
  { number: '02', title: 'Plant', text: 'Establish independent, fundamental, Bible-believing Baptist churches.', file: files.plant },
  { number: '03', title: 'Disciple', text: 'Teach believers to grow in the Word and become faithful servants.', file: files.disciple },
  { number: '04', title: 'Train', text: 'Equip faithful workers for a lasting ministry and a continuing harvest.', file: files.train },
]
const cardW = 242
const cardH = 246
const cardGapX = 18
const cardGapY = 17
const cardStartY = Math.max(161, visionIntroY + visionIntroHeight + 16)
visionCards.forEach((item, index) => {
  const column = index % 2
  const row = Math.floor(index / 2)
  const x = LEFT + column * (cardW + cardGapX)
  const top = cardStartY + row * (cardH + cardGapY)
  doc.roundedRect(x, top, cardW, cardH, 3).fill(colors.white)
  imageCover(image(item.file), x, top, cardW, 133, { offsetY: 0.4 })
  doc.font('Mono').fontSize(7.5).fillColor(colors.gold)
    .text(item.number, x + 14, top + 147, { characterSpacing: 0.9 })
  doc.font('SerifBold').fontSize(17).fillColor(colors.navy)
    .text(item.title, x + 43, top + 142, { width: cardW - 56 })
  doc.font('Body').fontSize(10.7).fillColor(colors.ink)
    .text(item.text, x + 14, top + 174, { width: cardW - 28, lineGap: 2.7 })
})

// Statement of faith
const faithSections = {
  god: {
    title: '1. God',
    text: 'I believe in one true and living God, the God of the Bible, the eternal Creator of the universe, who is omnipresent, omniscient, and omnipotent. He is perfect and complete in all His divine attributes, being holy, just, merciful, and gracious. There are three distinct Persons in the one Godhead—the Father, the Son, and the Holy Ghost—who are co-equal in power and possess the same divine nature.',
  },
  jesus: {
    title: '2. Jesus Christ',
    text: 'I believe that Jesus Christ is the Son of God and the second Person of the Trinity. He has existed eternally as God, took upon Himself human flesh and lived a perfect life on earth. He was crucified, died on the cross, was buried, and bodily rose from the dead three days later; His death was a substitutionary sacrifice for our sins.',
  },
  spirit: {
    title: '3. Holy Spirit',
    text: 'I believe that the Holy Spirit is the third Person of the Trinity and was active in Creation. He convicts men of sin and their need for salvation, bears witness to the truth of the Gospel, and works in the believer by indwelling, sealing, guiding, teaching, witnessing, sanctifying, empowering, and helping him.',
  },
  bible: {
    title: '4. Bible',
    text: 'I believe that the King James Bible (Authorized Version 1611) is the inspired, infallible, inerrant, and perfectly preserved Word of God for the English-speaking people. The Bible is the authoritative and final standard for all matters of faith and practice.',
  },
  creation: {
    title: '5. Creation',
    text: 'I believe in the literal interpretation of the creation account in Genesis, that God created the universe in six literal twenty-four-hour days, including man, who was created in the image and likeness of God.',
  },
  salvation: {
    title: '6. Salvation',
    text: 'I believe that man is a sinner by nature and by choice and is deserving of God’s judgment and eternal punishment in the lake of fire. The only way of salvation is through repentance toward God and faith in the Lord Jesus Christ, who died for our sins and rose again. Salvation is the free gift of God’s grace and cannot be earned through good works, religious exercises, or human merit; a person must place his complete dependence upon Jesus Christ for salvation.',
  },
  security: {
    title: '7. Eternal Security',
    text: 'I believe that every person who has truly received Jesus Christ as Saviour is eternally secure. All his sins—past, present, and future—are forgiven, and he possesses eternal life, having been made a new creature and adopted into God’s family. Salvation is received by God’s grace and is preserved by God’s power; therefore, the believer cannot lose his salvation.',
  },
  baptism: {
    title: '8. Baptism',
    text: 'I believe that baptism is an ordinance commanded by Christ for believers following salvation. It is the complete immersion of the believer in water, picturing the death, burial, and resurrection of Jesus Christ and the believer’s new life in Him. Baptism is not a means of salvation but an act of obedience and a public testimony of one’s faith in Christ.',
  },
  separation: {
    title: '9. Separation',
    text: 'I believe that God commands His children to separate themselves from sin, evil, and worldly influences and to live holy and pure lives in the midst of a godless generation. We should not compromise biblical truth, lower biblical standards, or blur the distinctions established by God’s Word.',
  },
  church: {
    title: '10. Church',
    text: 'I believe that a Baptist church is a called-out assembly of baptized believers organized to worship God, encourage and equip believers for Christian service, and carry out the Great Commission. I believe Christ is the Head of the church, and the pastor is His under-shepherd who is called to lead and shepherd His flock.',
  },
  commission: {
    title: '11. Great Commission',
    text: 'I believe that Jesus Christ has commissioned every believer and the local church to preach the Gospel to every creature and make disciples of all nations. I believe soul winning is the heartbeat of a church. I believe door-to-door and personal evangelism remain effective and greatly needed, and that churches should actively engage in it.',
  },
  judgment: {
    title: '12. God’s Judgment',
    text: 'I believe that God is both merciful and gracious and perfectly just and holy. He will judge all mankind righteously, and those who reject His offer of salvation through Jesus Christ will face everlasting punishment.',
  },
}

function drawFaithPage(sections, continuation = false) {
  addPage()
  let top = pageTitle('Statement of faith for deputation', continuation ? 'Statement of Faith • continued' : 'Statement of Faith', { size: 25 })
  for (const section of sections) {
    doc.font('SerifBold').fontSize(11.5).fillColor(colors.navy)
      .text(section.title, LEFT, top, { width: CONTENT_W })
    const titleHeight = doc.heightOfString(section.title, { width: CONTENT_W })
    top += titleHeight + 3
    top = paragraph(section.text, LEFT, top, CONTENT_W, { size: 10.7, lineGap: 2.3, after: 5.5 })
  }
  checkBottom('Statement of faith page', top)
}

drawFaithPage([
  faithSections.god,
  faithSections.jesus,
  faithSections.spirit,
  faithSections.bible,
  faithSections.creation,
  faithSections.salvation,
])
drawFaithPage([
  faithSections.security,
  faithSections.baptism,
  faithSections.separation,
  faithSections.church,
  faithSections.commission,
  faithSections.judgment,
], true)

// Contact and prayer
addPage()
y = pageTitle('Stay connected', 'Partner with us in prayer.')
doc.font('Body').fontSize(10.1).fillColor(colors.muted)
  .text('We would be grateful for your prayers and support as we prepare to serve in the Philippines.', LEFT, y - 1, { width: CONTENT_W })

const contactTop = 166
doc.roundedRect(LEFT, contactTop, 245, 337, 3).fill(colors.white)
doc.font('Mono').fontSize(7.2).fillColor(colors.gold)
  .text('MISSIONARY CONTACT', LEFT + 17, contactTop + 18, { characterSpacing: 0.9 })
let contactY = contactTop + 46
const contactLines = [
  ['EMAIL', 'gammadtophilippines@gmail.com', 'mailto:gammadtophilippines@gmail.com'],
  ['PHONE', '773-807-1597', 'tel:+17738071597'],
]
for (const [label, value, link] of contactLines) {
  doc.font('Mono').fontSize(6.7).fillColor(colors.gold).text(label, LEFT + 17, contactY, { characterSpacing: 0.75 })
  contactY = paragraph(value, LEFT + 17, contactY + 13, 211, { font: 'BodyBold', size: 9.4, after: 14, link })
}
doc.font('Mono').fontSize(6.7).fillColor(colors.gold)
  .text('SENDING CHURCH', LEFT + 17, contactY, { characterSpacing: 0.75 })
contactY = paragraph('Northwest Bible Baptist Church', LEFT + 17, contactY + 13, 211, { font: 'BodyBold', size: 9.1, after: 3 })
contactY = paragraph('9N889 Nesler Road\nElgin, IL 60124', LEFT + 17, contactY, 211, { size: 9, lineGap: 2.3, after: 15 })
doc.font('Mono').fontSize(6.7).fillColor(colors.gold)
  .text('MISSION BOARD', LEFT + 17, contactY, { characterSpacing: 0.75 })
contactY = paragraph('Northwest Bible Baptist Missions', LEFT + 17, contactY + 13, 211, { font: 'BodyBold', size: 9.1, after: 3 })
paragraph('9N889 Nesler Road\nElgin, IL 60124', LEFT + 17, contactY, 211, { size: 9, lineGap: 2.3, after: 0 })

const prayerX = LEFT + 267
doc.roundedRect(prayerX, contactTop, 235, 337, 3).fill(colors.navy)
doc.font('Mono').fontSize(7.1).fillColor('#f4ca74')
  .text('PLEASE PRAY FOR', prayerX + 17, contactTop + 18, { characterSpacing: 0.9 })
doc.font('SerifBold').fontSize(18).fillColor(colors.white)
  .text('Labourers for\nthe harvest.', prayerX + 17, contactTop + 42, { width: 201, lineGap: 3 })
const prayerPoints = [
  'A specific area and location to serve',
  'A church building and start-up fund',
  'Wisdom, good health, and safety during deputation',
  'Churches to partner with us',
  'Salvation and discipleship of lost souls',
]
let prayerY = contactTop + 107
for (const [index, item] of prayerPoints.entries()) {
  doc.circle(prayerX + 22, prayerY + 7, 2.2).fill('#f4ca74')
  prayerY = paragraph(item, prayerX + 34, prayerY, 180, { font: 'Serif', size: 9.2, lineGap: 2.2, after: 10, color: colors.white })
}

doc.roundedRect(LEFT, 531, CONTENT_W, 112, 3).fill(colors.cream)
doc.font('SerifBold').fontSize(15).fillColor(colors.navy)
  .text('Thank you for standing with us.', LEFT + 17, 550, { width: CONTENT_W - 34, align: 'center' })
doc.font('Body').fontSize(9.2).fillColor(colors.ink)
  .text('For the harvest in the Philippines — Matthew 9:37–38', LEFT + 17, 580, { width: CONTENT_W - 34, align: 'center' })

const output = fs.createWriteStream(OUTPUT)
doc.pipe(output)
doc.end()
await new Promise((resolve, reject) => {
  output.on('finish', resolve)
  output.on('error', reject)
})
const bytes = fs.statSync(OUTPUT).size
console.log(`Created ${path.relative(ROOT, OUTPUT)} (${pageNumber} pages, ${Math.round(bytes / 1024)} KB)`)
