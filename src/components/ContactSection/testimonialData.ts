export interface Testimonial {
  id: number;
  name: string;
  company: string;
  quote: string;
  portrait: string;
}

const baseTestimonials: Testimonial[] = [
  {
    id: 1,
    name: "Sarah Chen",
    company: "Nexus Digital",
    quote:
      "Ryan transformed our digital presence with an attention to detail that exceeded every expectation. The result was nothing short of remarkable.",
    portrait: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=400&h=667&fit=crop&crop=top,faces",
  },
  {
    id: 2,
    name: "Marcus Williams",
    company: "Altitude Labs",
    quote:
      "Working with Ryan was a masterclass in design thinking. He understood our vision before we could articulate it ourselves.",
    portrait: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&h=667&fit=crop&crop=top,faces",
  },
  {
    id: 3,
    name: "Tiny Fey",
    company: "Animal House Collective",
    quote:
      "Eiusmod anim nostrud eu irure eu ad amet irure ut. Dolor velit ipsum do consectetur nulla amet adipisicing et occaecat ad ullamco elit in in fugiat.",
    portrait: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400&h=667&fit=crop&crop=top,faces",
  },
  {
    id: 4,
    name: "Elena Vasquez",
    company: "Prism Studios",
    quote:
      "The craftsmanship in every pixel was evident. Ryan delivered a product that not only looked stunning but performed flawlessly under pressure.",
    portrait: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=400&h=667&fit=crop&crop=top,faces",
  },
  {
    id: 5,
    name: "David Park",
    company: "Horizon Ventures",
    quote:
      "From concept to launch, the process was seamless. Ryan has a rare ability to balance aesthetic vision with technical precision.",
    portrait: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=400&h=667&fit=crop&crop=top,faces",
  },
  {
    id: 6,
    name: "Amara Okafor",
    company: "Lumina Creative",
    quote:
      "Our conversion rates doubled after the redesign. Ryan doesn't just make things beautiful — he makes them work.",
    portrait: "https://images.unsplash.com/photo-1580489944761-15a19d654956?w=400&h=667&fit=crop&crop=top,faces",
  },
  {
    id: 7,
    name: "James Thornton",
    company: "Vertex Agency",
    quote:
      "I've worked with dozens of developers. Ryan is in a league of his own when it comes to blending creativity with engineering rigor.",
    portrait: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=400&h=667&fit=crop&crop=top,faces",
  },
];

export const testimonials: Testimonial[] = baseTestimonials;
