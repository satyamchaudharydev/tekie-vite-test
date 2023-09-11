import kritiNanda from './components/testimonial/kritiNanda.png'
import prakashMishra from './components/testimonial/prakashMishra.png'
import manuSeth from './components/testimonial/manuSeth.png'
import sudipto from './components/testimonial/sudipto.png'
const eventStatusLoggedOutTimer = 1000 * 60 * 1
const eventStatusLoggedInTimer = 1000 * 60 * 1


const withHttps = (url) => url ? url.replace(/^(?:(.*:)?\/\/)?(.*)/i, (match, schemma, nonSchemmaUrl) => schemma ? match : `https://${nonSchemmaUrl}`) : '';

const testimonialsData = [
    {
        detailedText: "My son Karan simply loved the trial coding class and naturally, he was super excited to join the coding course. As a parent, I'm so glad that my son will learn something new with so much enthusiasm. I wish the team all the best and may they succeed more than they have thought. Blessings.",
        author: 'Mother of Kriti Nanda',
        parentName: 'Karan Nanda',
        moreInfo: 'Parent | Delhi',
        image: kritiNanda,
    },
    {
        detailedText: "This is our son’s first experience learning about programming. He has had a great experience so far. The online training content - videos and chat dialogues - are well crafted to engage and entertain young people, while teaching key concepts. The sequence of topics also have worked really well for our son, giving him a foundation and building on it.",
        author: '',
        parentName: 'Prakash Mishra',
        moreInfo: 'Parent | Conneticut, USA',
        image: prakashMishra,
    },
    {
        detailedText: "It is every parent's dream to see their young ones catching up in this ever-changing and fast-paced IT world. We, as parents, are very satisfied with Tekie's curriculum and their team's artistic way of teaching Python Programming with their impeccably designed animated teaching module.",
        author: '',
        parentName: 'Manu Seth',
        moreInfo: 'Parent | Noida',
        image: manuSeth,
    },
    {
        detailedText: "The best learning happens when you are not learning, you are playing and enjoying. For Medha, learning has been a pleasant glide, thanks to a warm and interpersonal method of teaching; it's like she is learning from a friend who knows her! She loves the puzzles and other methods used- both experimental and classic.",
        author: '',
        parentName: 'Sudipto Mondal',
        moreInfo: 'Parent | Delhi',
        image: sudipto,
    },
]

export { eventStatusLoggedOutTimer, eventStatusLoggedInTimer, withHttps, testimonialsData }