import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';

export interface AuditLogOptions {
  module: string;
  action: string;
}

@Injectable()
export class AuditLogInterceptor implements NestInterceptor {
  constructor(private readonly options: AuditLogOptions) {}

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const request = context.switchToHttp().getRequest();
    const user = request.user;

    return next.handle().pipe(
      tap((responseData) => {
        if (!user) return;

        const entityId =
          request.params?.id ||
          responseData?.data?.id ||
          undefined;

        const entityName =
          responseData?.data?.name ||
          responseData?.data?.commercialName ||
          responseData?.data?.email ||
          undefined;

        console.log(`[AUDIT] user=${user.userId} module=${this.options.module} action=${this.options.action} entity=${entityId ?? 'N/A'} name=${entityName ?? 'N/A'}`);
      }),
    );
  }
}