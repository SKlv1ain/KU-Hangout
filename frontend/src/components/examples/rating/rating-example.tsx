'use client';
import { Rating, RatingButton } from '@/components/ui/shadcn-io/rating';
const Example = () => (
  <div className="flex flex-col items-center gap-8 p-8">
    {/* Yellow theme */}
    <div className="flex flex-col items-center gap-3">
      <Rating defaultValue={3}>
        {Array.from({ length: 5 }).map((_, index) => (
          <RatingButton className="text-yellow-500" key={index} />
        ))}
      </Rating>
      <span className="text-xs text-muted-foreground">Yellow</span>
    </div>
  </div>
);
export default Example;