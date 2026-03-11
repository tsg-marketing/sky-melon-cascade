import { useState, useEffect } from 'react';
import Icon from '@/components/ui/icon';

const PORTFOLIO_URL = "https://functions.poehali.dev/e7a04abf-c814-49ed-aeaa-9c3eab9257e7";

interface Project {
  id: number;
  title: string;
  category: string;
  image: string;
  guests: number;
  date: string;
}

const Portfolio = () => {
  const [selectedCategory, setSelectedCategory] = useState('Все');
  const [projects, setProjects] = useState<Project[]>([]);
  const [categories, setCategories] = useState<string[]>(['Все']);

  useEffect(() => {
    fetch(PORTFOLIO_URL)
      .then((res) => res.json())
      .then((data) => {
        if (Array.isArray(data) && data.length > 0) {
          setProjects(data);
          const cats = ['Все', ...Array.from(new Set(data.map((p: Project) => p.category)))];
          setCategories(cats as string[]);
        }
      })
      .catch(() => {});
  }, []);

  const filteredProjects = selectedCategory === 'Все'
    ? projects
    : projects.filter(project => project.category === selectedCategory);

  return (
    <section id="portfolio" className="py-20 bg-gradient-to-b from-background to-secondary/20">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-4xl md:text-5xl font-bold mb-4">Наши проекты</h2>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Более {projects.length} успешно реализованных мероприятий по всему Дальнему Востоку
          </p>
        </div>

        <div className="flex flex-wrap justify-center gap-3 mb-12">
          {categories.map((category) => (
            <button
              key={category}
              onClick={() => setSelectedCategory(category)}
              className={`px-6 py-2 rounded-full font-medium transition-all ${
                selectedCategory === category
                  ? 'bg-accent text-accent-foreground shadow-lg scale-105'
                  : 'bg-secondary/50 hover:bg-secondary text-secondary-foreground'
              }`}
            >
              {category}
            </button>
          ))}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredProjects.map((project) => (
            <div
              key={project.id}
              className="group relative overflow-hidden rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 hover:-translate-y-2"
            >
              <div className="aspect-[4/3] overflow-hidden">
                <img
                  src={project.image}
                  alt={project.title}
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                />
              </div>
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                <div className="absolute bottom-0 left-0 right-0 p-6 text-white transform translate-y-4 group-hover:translate-y-0 transition-transform duration-300">
                  <h3 className="text-xl font-bold mb-2">{project.title}</h3>
                  <div className="flex items-center gap-4 text-sm">
                    <div className="flex items-center gap-1">
                      <Icon name="Users" size={16} />
                      <span>{project.guests} гостей</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Icon name="Calendar" size={16} />
                      <span>{project.date}</span>
                    </div>
                  </div>
                </div>
              </div>
              <div className="absolute top-4 right-4 bg-accent text-accent-foreground px-3 py-1 rounded-full text-sm font-medium">
                {project.category}
              </div>
            </div>
          ))}
        </div>

        {filteredProjects.length === 0 && (
          <div className="text-center py-12">
            <Icon name="Search" size={48} className="mx-auto mb-4 text-muted-foreground" />
            <p className="text-xl text-muted-foreground">Проектов в этой категории пока нет</p>
          </div>
        )}
      </div>
    </section>
  );
};

export default Portfolio;
